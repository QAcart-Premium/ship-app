import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createAuthCookie } from '@/lib/auth'
import {
  encrypt,
  isTestCardValid,
  validateCardNumber,
  validateCardExpiry,
  validateCVV,
} from '@/lib/encryption'

/**
 * POST /api/auth/register
 * Register a new user with personal info and payment details
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      fullName,
      phone,
      country,
      city,
      street,
      postalCode,
      cardNumber,
      cardExpiry,
      cardCvv,
    } = body

    // Validate required fields
    if (
      !email ||
      !password ||
      !fullName ||
      !phone ||
      !country ||
      !city ||
      !street ||
      !postalCode ||
      !cardNumber ||
      !cardExpiry ||
      !cardCvv
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate personal info using sender card rules
    const senderRulesModule = await import('@/lib/rules/sender-card.json')
    const senderRules = senderRulesModule.default

    const formData = {
      senderName: fullName,
      senderPhone: phone,
      senderCountry: country,
      senderCity: city,
      senderStreet: street,
      senderPostalCode: postalCode,
    }

    // Validate each field against sender card rules
    const validationErrors: string[] = []

    for (const [fieldName, fieldRule] of Object.entries(senderRules.fields)) {
      const value = formData[fieldName as keyof typeof formData]

      if (fieldRule.validation?.required && (!value || value.trim() === '')) {
        validationErrors.push(fieldRule.validation.errorMessage || `${fieldRule.label} is required`)
        continue
      }

      if (value && fieldRule.validation?.minLength && value.length < fieldRule.validation.minLength) {
        validationErrors.push(fieldRule.validation.errorMessage || `${fieldRule.label} must be at least ${fieldRule.validation.minLength} characters`)
      }

      if (value && fieldRule.validation?.maxLength && value.length > fieldRule.validation.maxLength) {
        validationErrors.push(`${fieldRule.label} must be at most ${fieldRule.validation.maxLength} characters`)
      }

      if (value && fieldRule.validation?.pattern) {
        const regex = new RegExp(fieldRule.validation.pattern)
        if (!regex.test(value)) {
          validationErrors.push(fieldRule.validation.errorMessage || `${fieldRule.label} is invalid`)
        }
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0] }, // Return first error
        { status: 400 }
      )
    }

    // Validate card details
    const cleanedCardNumber = cardNumber.replace(/\s/g, '')

    if (!validateCardNumber(cleanedCardNumber)) {
      return NextResponse.json({ error: 'Invalid card number' }, { status: 400 })
    }

    if (!validateCardExpiry(cardExpiry)) {
      return NextResponse.json(
        { error: 'Invalid or expired card expiry date' },
        { status: 400 }
      )
    }

    if (!validateCVV(cardCvv)) {
      return NextResponse.json({ error: 'Invalid CVV' }, { status: 400 })
    }

    // Validate test card for mock payment
    if (!isTestCardValid(cleanedCardNumber, cardExpiry, cardCvv)) {
      return NextResponse.json(
        {
          error: 'Card validation failed. Please use test card: 4111111111111111, CVV: 111, and a future expiry date',
        },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Encrypt payment info
    const encryptedCardNumber = encrypt(cleanedCardNumber)
    const encryptedCardExpiry = encrypt(cardExpiry)
    const encryptedCardCvv = encrypt(cardCvv)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName,
        phone,
        country,
        city,
        street,
        postalCode,
        cardNumber: encryptedCardNumber,
        cardExpiry: encryptedCardExpiry,
        cardCvv: encryptedCardCvv,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        country: true,
        city: true,
        street: true,
        postalCode: true,
        createdAt: true,
      },
    })

    // Create auth cookie with JWT
    const cookie = createAuthCookie(user.id, user.email)

    // Return success with user data
    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user,
      },
      { status: 201 }
    )

    response.headers.set('Set-Cookie', cookie)

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
