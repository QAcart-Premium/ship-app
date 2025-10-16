import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import {
  encrypt,
  isTestCardValid,
  validateCardNumber,
  validateCardExpiry,
  validateCVV,
} from '@/lib/encryption'
import { prisma } from '@/lib/db'

/**
 * PUT /api/user/payment
 * Update user's payment information
 */
export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const { user, response } = await requireAuth(request)
    if (response) return response

    const body = await request.json()
    const { cardNumber, cardExpiry, cardCvv } = body

    // Validate required fields
    if (!cardNumber || !cardExpiry || !cardCvv) {
      return NextResponse.json(
        { error: 'All payment fields are required' },
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

    // Encrypt payment info
    const encryptedCardNumber = encrypt(cleanedCardNumber)
    const encryptedCardExpiry = encrypt(cardExpiry)
    const encryptedCardCvv = encrypt(cardCvv)

    // Update user's payment information
    await prisma.user.update({
      where: { id: user!.id },
      data: {
        cardNumber: encryptedCardNumber,
        cardExpiry: encryptedCardExpiry,
        cardCvv: encryptedCardCvv,
      },
    })

    return NextResponse.json(
      { message: 'Payment information updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update payment error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment information' },
      { status: 500 }
    )
  }
}
