/**
 * Business logic for price calculations and delivery estimates
 * This file contains important business rules that are great for testing!
 */

export type ServiceType = 'Standard' | 'Express' | 'Overnight'

export interface ServiceTypeConfig {
  maxWeight: number // Maximum allowed weight in kg
  basePrice: number // Base price in dollars
  pricePerKg: number // Additional price per kg
  deliveryDays: number // Estimated delivery days
  description: string
}

// Service type configurations - Great for testing boundary conditions!
export const SERVICE_TYPES: Record<ServiceType, ServiceTypeConfig> = {
  Standard: {
    maxWeight: 30,
    basePrice: 10,
    pricePerKg: 0.5,
    deliveryDays: 6, // 5-7 business days (using 6 for calculation)
    description: 'Standard delivery (5-7 business days)',
  },
  Express: {
    maxWeight: 20,
    basePrice: 20,
    pricePerKg: 1,
    deliveryDays: 3, // 2-3 business days
    description: 'Express delivery (2-3 business days)',
  },
  Overnight: {
    maxWeight: 10,
    basePrice: 35,
    pricePerKg: 2,
    deliveryDays: 1, // 1 business day
    description: 'Overnight delivery (1 business day)',
  },
}

// New service type configurations from rules
const NEW_SERVICE_CONFIGS: Record<string, ServiceTypeConfig> = {
  domestic_standard: {
    maxWeight: 50,
    basePrice: 15,
    pricePerKg: 0.5,
    deliveryDays: 3,
    description: 'Standard domestic delivery (2-3 business days)',
  },
  domestic_express: {
    maxWeight: 30,
    basePrice: 30,
    pricePerKg: 1,
    deliveryDays: 1,
    description: 'Express domestic delivery (1 business day)',
  },
  gulf_standard: {
    maxWeight: 30,
    basePrice: 25,
    pricePerKg: 1.5,
    deliveryDays: 5,
    description: 'Standard Gulf regional shipping (4-5 business days)',
  },
  gulf_express: {
    maxWeight: 20,
    basePrice: 45,
    pricePerKg: 2.5,
    deliveryDays: 2,
    description: 'Express Gulf regional shipping (2 business days)',
  },
  international_economy: {
    maxWeight: 25,
    basePrice: 35,
    pricePerKg: 2,
    deliveryDays: 10,
    description: 'Economy international shipping (8-10 business days)',
  },
  international_standard: {
    maxWeight: 25,
    basePrice: 50,
    pricePerKg: 3,
    deliveryDays: 7,
    description: 'Standard international shipping (5-7 business days)',
  },
}

/**
 * Calculate shipping price based on weight and service type
 * Important: This is a core business logic function - perfect for unit testing!
 *
 * Test scenarios to consider:
 * - Minimum weight (0.1 kg)
 * - Maximum weight for each service type (boundary testing)
 * - Weight exceeding maximum (should fail validation first)
 * - Exact boundary values (e.g., exactly 10kg for Overnight)
 * - Different service types with same weight
 */
export function calculatePrice(weight: number, serviceType: ServiceType | string): number {
  // Try old service types first
  let config = SERVICE_TYPES[serviceType as ServiceType]

  // If not found, try new service IDs
  if (!config) {
    config = NEW_SERVICE_CONFIGS[serviceType]
  }

  if (!config) {
    throw new Error(`Invalid service type: ${serviceType}`)
  }

  // This validation is great for boundary testing
  if (weight <= 0) {
    throw new Error('Weight must be greater than 0')
  }

  if (weight > config.maxWeight) {
    throw new Error(
      `Weight ${weight}kg exceeds maximum ${config.maxWeight}kg for ${serviceType} service`
    )
  }

  // Price calculation: base price + (weight * price per kg)
  // Round to 2 decimal places for currency
  const price = config.basePrice + weight * config.pricePerKg
  return Math.round(price * 100) / 100
}

/**
 * Calculate estimated delivery date based on service type
 * Note: This is a simplified calculation that doesn't account for weekends
 *
 * Test scenarios:
 * - Different service types should have different delivery times
 * - Estimated date should be in the future
 * - Date calculations should be consistent
 */
export function calculateEstimatedDelivery(
  serviceType: ServiceType | string,
  orderDate: Date = new Date()
): Date {
  // Try old service types first
  let config = SERVICE_TYPES[serviceType as ServiceType]

  // If not found, try new service IDs
  if (!config) {
    config = NEW_SERVICE_CONFIGS[serviceType]
  }

  if (!config) {
    throw new Error(`Invalid service type: ${serviceType}`)
  }

  const estimatedDate = new Date(orderDate)
  estimatedDate.setDate(estimatedDate.getDate() + config.deliveryDays)
  return estimatedDate
}

/**
 * Generate a unique tracking number
 * Format: TR + 9 random digits
 *
 * Test scenarios:
 * - Format validation (should always start with TR)
 * - Length validation (should always be 11 characters)
 * - Uniqueness (though this is better tested with actual database)
 */
export function generateTrackingNumber(): string {
  // Generate 9 random digits
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000)
  return `TR${randomDigits}`
}

/**
 * Validate if a weight is allowed for a given service type
 * This is useful for form validation
 *
 * Test scenarios:
 * - Valid weights within range
 * - Weights at exact boundaries
 * - Weights exceeding boundaries
 * - Negative weights
 * - Zero weight
 */
export function isValidWeight(weight: number, serviceType: ServiceType | string): boolean {
  // Try old service types first
  let config = SERVICE_TYPES[serviceType as ServiceType]

  // If not found, try new service IDs
  if (!config) {
    config = NEW_SERVICE_CONFIGS[serviceType]
  }

  if (!config) {
    return false
  }
  return weight > 0 && weight <= config.maxWeight
}

/**
 * Get the maximum allowed weight for a service type
 */
export function getMaxWeight(serviceType: ServiceType | string): number {
  // Try old service types first
  let config = SERVICE_TYPES[serviceType as ServiceType]

  // If not found, try new service IDs
  if (!config) {
    config = NEW_SERVICE_CONFIGS[serviceType]
  }

  if (!config) {
    throw new Error(`Invalid service type: ${serviceType}`)
  }
  return config.maxWeight
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
