import { NextRequest, NextResponse } from 'next/server'
import serviceCardRules from '@/lib/rules/service-card.json'
import type { ShipmentType } from '@/lib/types'

/**
 * POST /api/rules/service
 * Returns the available services for a given shipment type
 *
 * Request body:
 * - shipmentType: (required) The detected shipment type (Domestic, IntraGulf, International)
 * - formData: The current form data (contains weight)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shipmentType, formData } = body
    const weight = formData?.weight

    // Validate required parameters
    if (!shipmentType) {
      return NextResponse.json(
        { error: 'shipmentType is required' },
        { status: 400 }
      )
    }

    // Validate shipment type
    if (!['Domestic', 'IntraGulf', 'International'].includes(shipmentType)) {
      return NextResponse.json(
        { error: 'Invalid shipment type' },
        { status: 400 }
      )
    }

    // Get services for this shipment type
    const services = serviceCardRules.servicesByShipmentType[shipmentType as ShipmentType]

    if (!services) {
      return NextResponse.json(
        { error: 'No services found for this shipment type' },
        { status: 404 }
      )
    }

    // If weight is provided, filter services that can handle this weight
    let availableServices = services
    if (weight) {
      const weightNum = parseFloat(weight)
      if (!isNaN(weightNum)) {
        availableServices = services.filter(
          (service: any) => weightNum <= service.maxWeight
        )
      }
    }

    return NextResponse.json({
      cardName: serviceCardRules.cardName,
      title: serviceCardRules.title,
      enabled: true,
      shipmentType,
      services: availableServices,
      context: {
        weight: weight ? parseFloat(weight) : null,
      },
    })
  } catch (error) {
    console.error('Error loading service rules:', error)
    return NextResponse.json(
      { error: 'Failed to load service rules' },
      { status: 500 }
    )
  }
}
