import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { shipmentRepository } from '@/repositories'

/**
 * POST /api/shipments/finalize
 * Create a finalized shipment
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user, response } = await requireAuth(request)
    if (response) return response

    const body = await request.json()
    const { from, to, package: pkg, service, additional, rates } = body

    // Convert structured input to flat form data
    const formData = {
      senderName: from.name,
      senderPhone: from.phone,
      senderCountry: from.country,
      senderCity: from.city,
      senderStreet: from.street || '',
      senderPostalCode: from.postalCode,
      receiverName: to.name,
      receiverPhone: to.phone,
      receiverCountry: to.country,
      receiverCity: to.city,
      receiverStreet: to.street || '',
      receiverPostalCode: to.postalCode,
      weight: Number(pkg.weight),
      length: Number(pkg.length),
      width: Number(pkg.width),
      height: Number(pkg.height),
      itemDescription: pkg.description || '',
      serviceType: service.type,
      pickupMethod: service.pickupMethod,
      shipmentType: service.shipmentType,
      signatureRequired: additional.signature,
      containsLiquid: additional.liquid,
      insurance: additional.insurance,
      packaging: additional.packaging,
    }

    // Extract rates
    const rateData = {
      base: Number(rates.base),
      insurance: Number(rates.insurance),
      signature: Number(rates.signature),
      packaging: Number(rates.packaging),
      total: Number(rates.total),
    }

    // Create draft shipment first
    const draftShipment = await shipmentRepository.create(user!.id, formData, rateData)

    // Then finalize it
    const shipment = await shipmentRepository.finalize(draftShipment.id, user!.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Shipment finalized successfully',
        shipment,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error finalizing shipment:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to finalize shipment', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to finalize shipment' },
      { status: 500 }
    )
  }
}
