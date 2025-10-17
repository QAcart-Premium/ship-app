import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateTrackingNumber, calculateEstimatedDelivery } from '@/lib/calculations'
import { decrypt, isTestCardValid } from '@/lib/encryption'

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

    // Verify user has valid payment information
    if (!user!.cardNumber || !user!.cardExpiry || !user!.cardCvv) {
      return NextResponse.json(
        { error: 'Payment information not found. Please add your payment details in settings.' },
        { status: 400 }
      )
    }

    // Decrypt and validate payment info
    try {
      const cardNumber = decrypt(user!.cardNumber)
      const cardExpiry = decrypt(user!.cardExpiry)
      const cardCvv = decrypt(user!.cardCvv)

      if (!isTestCardValid(cardNumber, cardExpiry, cardCvv)) {
        return NextResponse.json(
          { error: 'Invalid payment information. Please update your payment details in settings.' },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid payment information. Please update your payment details in settings.' },
        { status: 400 }
      )
    }

    // Verify shipment exists and belongs to user
    const shipment = await prisma.shipment.findFirst({
      where: {
        id,
        userId: user!.id,
      },
    })

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      )
    }

    // Only allow finalizing draft shipments
    if (shipment.status !== 'draft') {
      return NextResponse.json(
        { error: 'Shipment is already finalized' },
        { status: 400 }
      )
    }

    // Generate tracking number if not exists
    const trackingNumber = shipment.trackingNumber || generateTrackingNumber()

    // Calculate estimated delivery
    const estimatedDelivery = calculateEstimatedDelivery(shipment.serviceType)

    // Update shipment status to finalized
    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        status: 'finalized',
        trackingNumber,
        estimatedDelivery,
        updatedAt: new Date(),
        trackingEvents: {
          create: {
            status: 'Order Placed',
            location: 'Online',
            description: 'Shipment order has been finalized and is ready for pickup',
            timestamp: new Date(),
          },
        },
      },
    })

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
    return NextResponse.json(
      { error: 'Failed to finalize shipment' },
      { status: 500 }
    )
  }
}
