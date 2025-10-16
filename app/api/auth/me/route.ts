import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/auth/me
 * Get current authenticated user's information
 */
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request)

    if (response) {
      return response // Unauthorized
    }

    // Return user data without sensitive info
    return NextResponse.json(
      {
        user: {
          id: user!.id,
          email: user!.email,
          fullName: user!.fullName,
          phone: user!.phone,
          country: user!.country,
          city: user!.city,
          street: user!.street,
          postalCode: user!.postalCode,
          createdAt: user!.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    )
  }
}
