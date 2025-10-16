import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  calculatePrice,
  calculateEstimatedDelivery,
  generateTrackingNumber,
} from '@/lib/calculations'
import { validateShipmentForm } from '@/lib/validations'
import type { CreateShipmentData } from '@/lib/types'

/**
 * GET /api/shipments
 * Retrieve all shipments with optional filtering, sorting, and pagination
 *
 * Query parameters:
 * - search: Search by tracking number, sender name, or receiver name
 * - status: Filter by status (Pending, In Transit, Delivered, Failed, or All)
 * - sortBy: Sort by field (createdAt, price, status)
 * - sortOrder: Sort order (asc, desc)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 *
 * This endpoint is great for testing:
 * - Query parameter handling
 * - Filtering logic
 * - Sorting
 * - Pagination
 * - Database queries
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'All'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause for filtering
    const where: any = {}

    // Search filter - searches across multiple fields
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { senderName: { contains: search, mode: 'insensitive' } },
        { receiverName: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Status filter
    if (status !== 'All') {
      where.status = status
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'createdAt' || sortBy === 'price' || sortBy === 'status') {
      orderBy[sortBy] = sortOrder
    }

    // Execute query with pagination
    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.shipment.count({ where }),
    ])

    return NextResponse.json({
      shipments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching shipments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/shipments
 * Create a new shipment
 *
 * Request body should include:
 * - senderName, senderStreet, senderCity, senderPostalCode, senderCountry, senderPhone
 * - receiverName, receiverStreet, receiverCity, receiverPostalCode, receiverCountry, receiverPhone
 * - weight, length, width, height
 * - serviceType
 *
 * This endpoint is great for testing:
 * - Input validation
 * - Business logic (price calculation)
 * - Data creation
 * - Error handling
 * - Response format
 */
export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json()
    const isDraft = body.isDraft || false

    // Validate form data only if not a draft
    if (!isDraft) {
      const validationErrors = validateShipmentForm({
        ...body,
        weight: Number(body.weight) || 0,
        length: Number(body.length) || 0,
        width: Number(body.width) || 0,
        height: Number(body.height) || 0,
      })

      if (validationErrors.length > 0) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validationErrors.map((e) => e.message),
          },
          { status: 400 }
        )
      }
    }

    // Generate tracking number
    const trackingNumber = generateTrackingNumber()

    // Calculate price based on weight and service type
    const price = calculatePrice(Number(body.weight), body.serviceType)

    // Calculate estimated delivery
    const estimatedDelivery = calculateEstimatedDelivery(body.serviceType)

    // Create shipment in database
    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        senderName: body.senderName || '',
        senderStreet: body.senderStreet || '',
        senderCity: body.senderCity || '',
        senderPostalCode: body.senderPostalCode || '',
        senderCountry: body.senderCountry || '',
        senderPhone: body.senderPhone || '',
        receiverName: body.receiverName || '',
        receiverStreet: body.receiverStreet || '',
        receiverCity: body.receiverCity || '',
        receiverPostalCode: body.receiverPostalCode || '',
        receiverCountry: body.receiverCountry || '',
        receiverPhone: body.receiverPhone || '',
        weight: Number(body.weight) || 0,
        length: Number(body.length) || 0,
        width: Number(body.width) || 0,
        height: Number(body.height) || 0,
        pickupMethod: body.pickupMethod || 'home',
        serviceType: body.serviceType || 'Standard',
        signatureRequired: body.signatureRequired || false,
        containsLiquid: body.containsLiquid || false,
        price,
        isDraft,
        status: isDraft ? 'Draft' : 'Pending',
        estimatedDelivery: isDraft ? null : estimatedDelivery,
        trackingEvents: isDraft ? undefined : {
          create: {
            status: 'Order Placed',
            location: 'Online',
            description: 'Shipment order has been created and is awaiting pickup',
            timestamp: new Date(),
          },
        },
      },
      include: {
        trackingEvents: true,
      },
    })

    return NextResponse.json(shipment, { status: 201 })
  } catch (error) {
    console.error('Error creating shipment:', error)

    // Handle specific errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to create shipment', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    )
  }
}
