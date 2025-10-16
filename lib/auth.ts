import { NextRequest, NextResponse } from 'next/server'
import { serialize, parse } from 'cookie'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const AUTH_COOKIE_NAME = 'auth_session'
const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const JWT_EXPIRES_IN = '30d' // 30 days

interface JWTPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

/**
 * Hashes a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compares a password with its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Creates a signed JWT token
 */
export function createJWT(userId: number, email: string): string {
  return jwt.sign(
    { userId, email } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    // Token is invalid or expired
    return null
  }
}

/**
 * Creates an authentication cookie with signed JWT
 */
export function createAuthCookie(userId: number, email: string): string {
  const token = createJWT(userId, email)
  return serialize(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

/**
 * Removes the authentication cookie
 */
export function clearAuthCookie(): string {
  return serialize(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

/**
 * Gets user ID from JWT cookie
 */
export function getUserIdFromCookie(request: NextRequest): number | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = parse(cookieHeader)
  const token = cookies[AUTH_COOKIE_NAME]

  if (!token) return null

  const payload = verifyJWT(token)
  return payload ? payload.userId : null
}

/**
 * Gets the current authenticated user
 */
export async function getCurrentUser(request: NextRequest) {
  const userId = getUserIdFromCookie(request)
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      country: true,
      city: true,
      street: true,
      postalCode: true,
      cardNumber: true,
      cardExpiry: true,
      cardCvv: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return user
}

/**
 * Requires authentication - returns user or error response
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request)

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { user, response: null }
}
