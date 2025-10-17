import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { UpdateStatusData } from '@/lib/types'
import { requireAuth } from '@/lib/auth'
import { calculatePrice } from '@/lib/calculations'

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
    // Require authentication
    const { user, response } = await requireAuth(request)
    if (response) return response

    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 })
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        id,
        userId: user!.id, // Ensure user can only access their own shipments
      },
      include: {
        trackingEvents: {
          orderBy: { timestamp: 'asc' },
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    return NextResponse.json({ shipment })
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
 * Update a shipment (for editing draft shipments)
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
    // Require authentication
    const { user, response } = await requireAuth(request)
    if (response) return response

    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 })
    }

    const body: any = await request.json()

    // Check if shipment exists and belongs to user
    const existingShipment = await prisma.shipment.findFirst({
      where: {
        id,
        userId: user!.id,
      },
    })

    if (!existingShipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Only allow updating draft shipments
    if (existingShipment.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only edit draft shipments' },
        { status: 400 }
      )
    }

    // Recalculate price based on weight and service type
    const price = calculatePrice(Number(body.weight), body.serviceType)

    // Update shipment with new data
    const shipment = await prisma.shipment.update({
      where: { id },
      data: {
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
        contentDescription: body.contentDescription || '',
        shipmentType: body.shipmentType || 'Domestic',
        pickupMethod: body.pickupMethod || 'home',
        serviceType: body.serviceType || 'Standard',
        signatureRequired: body.signatureRequired || false,
        containsLiquid: body.containsLiquid || false,
        insurance: body.insurance || false,
        packaging: body.packaging || false,
        price,
        baseCost: Number(body.baseCost) || 0,
        insuranceCost: Number(body.insuranceCost) || 0,
        signatureCost: Number(body.signatureCost) || 0,
        packagingCost: Number(body.packagingCost) || 0,
        totalCost: Number(body.totalCost) || 0,
        updatedAt: new Date(),
      },
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
    // Require authentication
    const { user, response } = await requireAuth(request)
    if (response) return response

    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid shipment ID' }, { status: 400 })
    }

    // Check if shipment exists and belongs to user
    const existingShipment = await prisma.shipment.findFirst({
      where: {
        id,
        userId: user!.id,
      },
    })

    if (!existingShipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Business rule: Can delete draft shipments or cancel pending/in_transit shipments
    // Cannot delete delivered shipments
    if (existingShipment.status === 'delivered') {
      return NextResponse.json(
        {
          error: 'Cannot delete shipment',
          details: 'Delivered shipments cannot be deleted',
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
      message: existingShipment.status === 'draft'
        ? 'Shipment deleted successfully'
        : 'Shipment cancelled successfully',
    })
  } catch (error) {
    console.error('Error deleting shipment:', error)
    return NextResponse.json(
      { error: 'Failed to delete shipment' },
      { status: 500 }
    )
  }
}
