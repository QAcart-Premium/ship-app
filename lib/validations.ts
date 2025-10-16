/**
 * Form validation functions for shipment creation
 * These validations are excellent for testing input validation scenarios
 */

import { SERVICE_TYPES, ServiceType } from './calculations'

export interface ValidationError {
  field: string
  message: string
}

export interface ShipmentFormData {
  senderName: string
  senderStreet: string
  senderCity: string
  senderPostalCode: string
  senderCountry: string
  senderPhone: string
  receiverName: string
  receiverStreet: string
  receiverCity: string
  receiverPostalCode: string
  receiverCountry: string
  receiverPhone: string
  weight: number
  length: number
  width: number
  height: number
  pickupMethod: string
  serviceType: ServiceType
  signatureRequired: boolean
  containsLiquid: boolean
}

/**
 * Validate phone number format
 * Accepts: 555-0123, (555) 012-3456, 555.012.3456, 5550123456
 *
 * Test scenarios:
 * - Valid formats
 * - Invalid formats (too short, too long, special characters)
 * - International formats (optional enhancement)
 */
export function validatePhone(phone: string): ValidationError | null {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')

  // Should have 10 digits (US phone number)
  if (digitsOnly.length !== 10) {
    return {
      field: 'phone',
      message: 'Phone number must be 10 digits',
    }
  }

  return null
}

/**
 * Validate name field
 * Must be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes
 *
 * Test scenarios:
 * - Valid names (simple, compound, with hyphens/apostrophes)
 * - Too short (less than 2 characters)
 * - Invalid characters (numbers, special symbols)
 * - Empty strings
 */
export function validateName(name: string, fieldName: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    }
  }

  if (name.trim().length < 2) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least 2 characters`,
    }
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(name)) {
    return {
      field: fieldName,
      message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
    }
  }

  return null
}

/**
 * Validate required text field
 * Must not be empty and have minimum length
 */
export function validateRequiredField(
  value: string,
  fieldName: string,
  minLength: number = 2
): ValidationError | null {
  if (!value || value.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    }
  }

  if (value.trim().length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters`,
    }
  }

  return null
}

/**
 * Validate postal code
 * Basic validation - must be 3-10 characters
 */
export function validatePostalCode(postalCode: string, fieldName: string): ValidationError | null {
  if (!postalCode || postalCode.trim().length === 0) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    }
  }

  const trimmed = postalCode.trim()
  if (trimmed.length < 3 || trimmed.length > 10) {
    return {
      field: fieldName,
      message: `${fieldName} must be between 3 and 10 characters`,
    }
  }

  return null
}

/**
 * Validate weight based on service type
 * This is crucial for testing business rule enforcement
 *
 * Test scenarios:
 * - Valid weights within range
 * - Weight exactly at maximum (boundary testing)
 * - Weight exceeding maximum
 * - Zero or negative weights
 * - Very small weights (e.g., 0.1 kg)
 * - Decimal precision
 */
export function validateWeight(
  weight: number,
  serviceType: ServiceType
): ValidationError | null {
  if (!weight || weight <= 0) {
    return {
      field: 'weight',
      message: 'Weight must be greater than 0',
    }
  }

  const config = SERVICE_TYPES[serviceType]
  if (!config) {
    return {
      field: 'serviceType',
      message: 'Invalid service type',
    }
  }

  if (weight > config.maxWeight) {
    return {
      field: 'weight',
      message: `Weight cannot exceed ${config.maxWeight}kg for ${serviceType} service`,
    }
  }

  return null
}

/**
 * Validate package dimensions
 * Each dimension must be greater than 0 and less than 200 cm
 *
 * Test scenarios:
 * - Valid dimensions
 * - Zero or negative dimensions
 * - Exceeding maximum
 * - Very large packages
 */
export function validateDimensions(
  length: number,
  width: number,
  height: number
): ValidationError | null {
  const MAX_DIMENSION = 200 // cm

  if (!length || length <= 0) {
    return {
      field: 'length',
      message: 'Length must be greater than 0',
    }
  }

  if (!width || width <= 0) {
    return {
      field: 'width',
      message: 'Width must be greater than 0',
    }
  }

  if (!height || height <= 0) {
    return {
      field: 'height',
      message: 'Height must be greater than 0',
    }
  }

  if (length > MAX_DIMENSION) {
    return {
      field: 'length',
      message: `Length cannot exceed ${MAX_DIMENSION}cm`,
    }
  }

  if (width > MAX_DIMENSION) {
    return {
      field: 'width',
      message: `Width cannot exceed ${MAX_DIMENSION}cm`,
    }
  }

  if (height > MAX_DIMENSION) {
    return {
      field: 'height',
      message: `Height cannot exceed ${MAX_DIMENSION}cm`,
    }
  }

  return null
}

/**
 * Validate service type
 *
 * Test scenarios:
 * - Valid service types
 * - Invalid service types
 * - Empty/null values
 */
export function validateServiceType(serviceType: string): ValidationError | null {
  if (!serviceType) {
    return {
      field: 'serviceType',
      message: 'Service type is required',
    }
  }

  if (!SERVICE_TYPES[serviceType as ServiceType]) {
    return {
      field: 'serviceType',
      message: 'Invalid service type selected',
    }
  }

  return null
}

/**
 * Validate entire shipment form
 * Returns array of all validation errors
 *
 * Test scenarios:
 * - Valid complete form
 * - Multiple validation errors
 * - Individual field errors
 */
export function validateShipmentForm(data: ShipmentFormData): ValidationError[] {
  const errors: ValidationError[] = []

  // Validate sender information
  const senderNameError = validateName(data.senderName, 'Sender name')
  if (senderNameError) errors.push(senderNameError)

  const senderStreetError = validateRequiredField(data.senderStreet, 'senderStreet', 5)
  if (senderStreetError) errors.push(senderStreetError)

  const senderCityError = validateRequiredField(data.senderCity, 'senderCity', 2)
  if (senderCityError) errors.push(senderCityError)

  const senderPostalCodeError = validatePostalCode(data.senderPostalCode, 'senderPostalCode')
  if (senderPostalCodeError) errors.push(senderPostalCodeError)

  const senderCountryError = validateRequiredField(data.senderCountry, 'senderCountry', 2)
  if (senderCountryError) errors.push(senderCountryError)

  const senderPhoneError = validatePhone(data.senderPhone)
  if (senderPhoneError) {
    errors.push({ ...senderPhoneError, field: 'senderPhone' })
  }

  // Validate receiver information
  const receiverNameError = validateName(data.receiverName, 'Receiver name')
  if (receiverNameError) errors.push(receiverNameError)

  const receiverStreetError = validateRequiredField(data.receiverStreet, 'receiverStreet', 5)
  if (receiverStreetError) errors.push(receiverStreetError)

  const receiverCityError = validateRequiredField(data.receiverCity, 'receiverCity', 2)
  if (receiverCityError) errors.push(receiverCityError)

  const receiverPostalCodeError = validatePostalCode(data.receiverPostalCode, 'receiverPostalCode')
  if (receiverPostalCodeError) errors.push(receiverPostalCodeError)

  const receiverCountryError = validateRequiredField(data.receiverCountry, 'receiverCountry', 2)
  if (receiverCountryError) errors.push(receiverCountryError)

  const receiverPhoneError = validatePhone(data.receiverPhone)
  if (receiverPhoneError) {
    errors.push({ ...receiverPhoneError, field: 'receiverPhone' })
  }

  // Validate package information
  const serviceTypeError = validateServiceType(data.serviceType)
  if (serviceTypeError) errors.push(serviceTypeError)

  const weightError = validateWeight(data.weight, data.serviceType)
  if (weightError) errors.push(weightError)

  const dimensionsError = validateDimensions(data.length, data.width, data.height)
  if (dimensionsError) errors.push(dimensionsError)

  return errors
}

/**
 * Helper to check if form data is valid
 */
export function isFormValid(data: ShipmentFormData): boolean {
  return validateShipmentForm(data).length === 0
}
