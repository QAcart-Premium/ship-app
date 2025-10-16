import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

/**
 * POST /api/auth/logout
 * Logout user by clearing authentication cookie
 */
export async function POST(request: NextRequest) {
  try {
    const cookie = clearAuthCookie()

    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )

    response.headers.set('Set-Cookie', cookie)

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
