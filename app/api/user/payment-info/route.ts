import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { decrypt, maskCardNumber } from '@/lib/encryption'

/**
 * GET /api/user/payment-info
 * Get masked payment information for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { user, response } = await requireAuth(request)
    if (response) return response

    // Decrypt and mask card number
    const cardNumber = decrypt(user!.cardNumber)
    const maskedCardNumber = maskCardNumber(cardNumber)

    return NextResponse.json(
      {
        maskedCardNumber,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get payment info error:', error)
    return NextResponse.json(
      { error: 'Failed to get payment information' },
      { status: 500 }
    )
  }
}
