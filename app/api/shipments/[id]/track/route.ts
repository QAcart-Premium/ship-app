import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/shipments/[id]/track
 * Get tracking information for a shipment by ID or tracking number
 *
 * This endpoint can accept either:
 * - Numeric ID (e.g., /api/shipments/1/track)
 * - Tracking number via query param (e.g., /api/shipments/track?number=TR123456789)
 *
 * This endpoint is great for testing:
 * - Multiple lookup methods (ID vs tracking number)
 * - Query parameter handling
 * - Data retrieval with relations
 * - Public API endpoint simulation (no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let shipment

    // Check if we're looking up by ID or tracking number
    const id = parseInt(params.id)

    if (!isNaN(id)) {
      // Lookup by ID
      shipment = await prisma.shipment.findUnique({
        where: { id },
        include: {
          trackingEvents: {
            orderBy: { timestamp: 'asc' },
          },
        },
      })
    } else {
      // If id is not a number, it might be "track" endpoint with query param
      const trackingNumber = request.nextUrl.searchParams.get('number')

      if (trackingNumber) {
        shipment = await prisma.shipment.findUnique({
          where: { trackingNumber },
          include: {
            trackingEvents: {
              orderBy: { timestamp: 'asc' },
            },
          },
        })
      }
    }

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      )
    }

    // Return tracking information
    // This format is useful for public tracking pages
    return NextResponse.json({
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
      serviceType: shipment.serviceType,
      events: shipment.trackingEvents.map((event) => ({
        status: event.status,
        location: event.location,
        description: event.description,
        timestamp: event.timestamp,
      })),
    })
  } catch (error) {
    console.error('Error fetching tracking information:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    )
  }
}
