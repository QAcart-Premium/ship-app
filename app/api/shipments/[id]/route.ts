import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { UpdateStatusData } from '@/lib/types'

/**
 * GET /api/shipments/[id]
 * Retrieve a single shipment by ID with all tracking events
 *
 * This endpoint is great for testing:
 * - Parameter extraction from URL
 * - Database queries with relations
 * - 404 error handling
 * - Response structure
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 })
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        trackingEvents: {
          orderBy: { timestamp: 'asc' },
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    return NextResponse.json(shipment)
  } catch (error) {
    console.error('Error fetching shipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipment' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/shipments/[id]
 * Update a shipment (typically for status updates)
 *
 * This endpoint is great for testing:
 * - Data updates
 * - State transitions
 * - Validation of updates
 * - Concurrent modification scenarios
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 })
    }

    const body: UpdateStatusData = await request.json()

    // Check if shipment exists
    const existingShipment = await prisma.shipment.findUnique({
      where: { id },
    })

    if (!existingShipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Don't allow updates to delivered or failed shipments
    if (existingShipment.status === 'Delivered' || existingShipment.status === 'Failed') {
      return NextResponse.json(
        { error: `Cannot update ${existingShipment.status.toLowerCase()} shipment` },
        { status: 400 }
      )
    }

    // Update shipment status
    const updateData: any = {
      status: body.status,
      updatedAt: new Date(),
    }

    // If status is being set to Delivered, set actual delivery date
    if (body.status === 'Delivered') {
      updateData.actualDelivery = new Date()
    }

    const shipment = await prisma.shipment.update({
      where: { id },
      data: updateData,
      include: {
        trackingEvents: {
          orderBy: { timestamp: 'asc' },
        },
      },
    })

    return NextResponse.json(shipment)
  } catch (error) {
    console.error('Error updating shipment:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to update shipment', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update shipment' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/shipments/[id]
 * Delete a shipment (cancel an order)
 *
 * This endpoint is great for testing:
 * - Deletion logic
 * - Business rules (can only cancel certain statuses)
 * - Cascade deletions (tracking events)
 * - Authorization (in a real app)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 })
    }

    // Check if shipment exists
    const existingShipment = await prisma.shipment.findUnique({
      where: { id },
    })

    if (!existingShipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Business rule: Can only cancel pending or picked up shipments
    // This is a great test scenario for business logic validation
    if (
      existingShipment.status !== 'Pending' &&
      existingShipment.status !== 'Picked Up'
    ) {
      return NextResponse.json(
        {
          error: 'Cannot cancel shipment',
          details: 'Only pending or picked up shipments can be cancelled',
        },
        { status: 400 }
      )
    }

    // Delete shipment (tracking events will be cascade deleted)
    await prisma.shipment.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Shipment cancelled successfully',
    })
  } catch (error) {
    console.error('Error deleting shipment:', error)
    return NextResponse.json(
      { error: 'Failed to delete shipment' },
      { status: 500 }
    )
  }
}
