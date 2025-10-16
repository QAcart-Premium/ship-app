/**
 * TypeScript type definitions for the ShipTest application
 */

import { Shipment, TrackingEvent } from '@prisma/client'

// Status types for shipments
export type ShipmentStatus = 'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Failed'

// Service types
export type ServiceType = 'Standard' | 'Express' | 'Overnight'

// Shipment with tracking events included
export type ShipmentWithEvents = Shipment & {
  trackingEvents: TrackingEvent[]
}

// Pickup method types
export type PickupMethod = 'home' | 'postal_office'

// Form data for creating a new shipment
export interface CreateShipmentData {
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
  pickupMethod: PickupMethod
  serviceType: ServiceType
  signatureRequired: boolean
  containsLiquid: boolean
}

// Data for updating shipment status
export interface UpdateStatusData {
  status: ShipmentStatus
  location?: string
  description?: string
}

// Search and filter parameters
export interface ShipmentFilters {
  search?: string // Search by tracking number, sender, or receiver
  status?: ShipmentStatus | 'All'
  sortBy?: 'createdAt' | 'price' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// API response types
export interface ShipmentsResponse {
  shipments: Shipment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  error: string
  details?: string[]
}

export interface ApiSuccess<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

// Status badge color mapping
export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  'Pending': 'bg-gray-100 text-gray-800',
  'Picked Up': 'bg-blue-100 text-blue-800',
  'In Transit': 'bg-yellow-100 text-yellow-800',
  'Out for Delivery': 'bg-purple-100 text-purple-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Failed': 'bg-red-100 text-red-800',
}

// Timeline status progression
export const STATUS_PROGRESSION: ShipmentStatus[] = [
  'Pending',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
]
