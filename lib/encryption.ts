import crypto from 'crypto'

// Encryption key should be 32 bytes for AES-256
// In production, this should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-byte-encryption-key!'
const ALGORITHM = 'aes-256-cbc'

// Ensure key is exactly 32 bytes
const getKey = (): Buffer => {
  const key = ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)
  return Buffer.from(key)
}

/**
 * Encrypts sensitive data (like credit card information)
 * @param text - The text to encrypt
 * @returns Encrypted text in format: iv:encryptedData
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // Return IV + encrypted data (we need IV for decryption)
  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * Decrypts encrypted data
 * @param encryptedText - The encrypted text in format: iv:encryptedData
 * @returns Decrypted text
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':')

  if (!ivHex || !encrypted) {
    throw new Error('Invalid encrypted data format')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Masks a credit card number, showing only last 4 digits
 * @param cardNumber - Full card number
 * @returns Masked card number (e.g., "**** **** **** 4444")
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '')
  if (cleaned.length < 4) return cardNumber

  const lastFour = cleaned.slice(-4)
  return `**** **** **** ${lastFour}`
}

/**
 * Validates if card number passes basic Luhn algorithm check
 * @param cardNumber - Card number to validate
 * @returns true if valid, false otherwise
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '')

  // Must be 13-19 digits
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false
  }

  // Luhn algorithm
  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Validates card expiry date
 * @param expiry - Expiry in MM/YY or MM/YYYY format
 * @returns true if valid and not expired, false otherwise
 */
export function validateCardExpiry(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2,4})$/)
  if (!match) return false

  const month = parseInt(match[1], 10)
  let year = parseInt(match[2], 10)

  // Convert 2-digit year to 4-digit
  if (year < 100) {
    year += 2000
  }

  // Validate month
  if (month < 1 || month > 12) return false

  // Check if expired
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false

  return true
}

/**
 * Validates CVV
 * @param cvv - CVV code
 * @returns true if valid (3 or 4 digits), false otherwise
 */
export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv)
}

/**
 * Validates test card for mock payment processing
 * @param cardNumber - Card number
 * @param expiry - Expiry date
 * @param cvv - CVV code
 * @returns true if test card is valid (4111111111111111 with valid expiry and 111 CVV)
 */
export function isTestCardValid(cardNumber: string, expiry: string, cvv: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '')
  return (
    cleaned === '4111111111111111' &&
    validateCardExpiry(expiry) &&
    cvv === '111'
  )
}
