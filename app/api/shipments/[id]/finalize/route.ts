import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { shipmentRepository } from '@/repositories'

/**
 * POST /api/shipments/[id]/finalize
 * Finalize a draft shipment and update status
 */
export async function POST(
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

    // Verify shipment exists and belongs to user
    const shipment = await shipmentRepository.findById(id, user!.id)

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Only allow finalizing draft shipments
    if (shipment.status !== 'draft') {
      return NextResponse.json({ error: 'Shipment is already finalized' }, { status: 400 })
    }

    // Finalize shipment
    const updatedShipment = await shipmentRepository.finalize(id, user!.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Shipment finalized successfully',
        shipment: updatedShipment,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Shipment finalization error:', error)
    return NextResponse.json({ error: 'Failed to finalize shipment' }, { status: 500 })
  }
}
