import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { decrypt, isTestCardValid } from '@/lib/encryption'

/**
 * POST /api/payment/process
 * Process payment using saved card details
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user, response } = await requireAuth(request)
    if (response) return response

    // Decrypt payment info
    const cardNumber = decrypt(user!.cardNumber)
    const cardExpiry = decrypt(user!.cardExpiry)
    const cardCvv = decrypt(user!.cardCvv)

    // Validate test card
    if (!isTestCardValid(cardNumber, cardExpiry, cardCvv)) {
      return NextResponse.json(
        { error: 'Payment failed. Invalid card details.' },
        { status: 400 }
      )
    }

    // Mock successful payment
    return NextResponse.json(
      {
        success: true,
        message: 'Payment processed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}
