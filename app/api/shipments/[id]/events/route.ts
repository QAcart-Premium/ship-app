import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface TrackingEventData {
  status: string
  location: string
  description: string
}

/**
 * POST /api/shipments/[id]/events
 * Add a tracking event to a shipment
 *
 * This endpoint is great for testing:
 * - Creating related records
 * - State management
 * - Timestamp handling
 * - Business logic (should tracking events be allowed after delivery?)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 })
    }

    const body: TrackingEventData = await request.json()

    // Validate required fields
    if (!body.status || !body.location || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: status, location, description' },
        { status: 400 }
      )
    }

    // Check if shipment exists
    const shipment = await prisma.shipment.findUnique({
      where: { id },
    })

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Create tracking event
    const trackingEvent = await prisma.trackingEvent.create({
      data: {
        shipmentId: id,
        status: body.status,
        location: body.location,
        description: body.description,
        timestamp: new Date(),
      },
    })

    // Update shipment status to match the latest tracking event
    await prisma.shipment.update({
      where: { id },
      data: {
        status: body.status,
        // If status is Delivered, set actual delivery date
        ...(body.status === 'Delivered' && { actualDelivery: new Date() }),
      },
    })

    return NextResponse.json(trackingEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating tracking event:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to create tracking event', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create tracking event' },
      { status: 500 }
    )
  }
}
