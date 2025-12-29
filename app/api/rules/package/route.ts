import { NextRequest, NextResponse } from 'next/server'
import packageCardRules from '@/lib/rules/package-card.json'
import countriesData from '@/lib/rules/countries.json'
import type { ShipmentType } from '@/lib/types'

/**
 * Determine if a country is a Gulf country
 */
function isGulfCountry(countryName: string): boolean {
  const country = countriesData.countries.find((c) => c.nameAr === countryName || c.name === countryName)
  return country?.isGulf || false
}

/**
 * Determine the shipment type based on sender and receiver countries
 */
function determineShipmentType(
  senderCountry: string,
  receiverCountry: string
): ShipmentType {
  // Same country = Domestic
  if (senderCountry === receiverCountry) {
    return 'Domestic'
  }

  // Both are Gulf countries = IntraGulf
  if (isGulfCountry(senderCountry) && isGulfCountry(receiverCountry)) {
    return 'IntraGulf'
  }

  // Otherwise = International
  return 'International'
}

/**
 * POST /api/rules/package
 * Returns the rules for the package card
 *
 * Request body:
 * - from: { country: string }
 * - to: { country: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from, to } = body
    const senderCountry = from?.country
    const receiverCountry = to?.country

    // Validate required parameters
    if (!senderCountry || !receiverCountry) {
      return NextResponse.json(
        { error: 'دولة المرسل والمستلم مطلوبة' },
        { status: 400 }
      )
    }

    // Determine shipment type
    const shipmentType = determineShipmentType(senderCountry, receiverCountry)

    // Get the rules for this shipment type
    const typeRules = packageCardRules.shipmentTypes[shipmentType]

    if (!typeRules) {
      return NextResponse.json(
        { error: 'نوع الشحنة غير صالح' },
        { status: 400 }
      )
    }

    // Load the base package card rules
    const rules = JSON.parse(JSON.stringify(packageCardRules))

    // Update weight validation with the max weight for this shipment type
    if (rules.fields.weight?.validation) {
      rules.fields.weight.validation.max = typeRules.maxWeight
      rules.fields.weight.validation.errorMessage = `يجب أن يكون الوزن بين 0.1 و ${typeRules.maxWeight} كجم`
    }

    // Check if sender is non-Gulf and receiver is Gulf
    const isSenderGulf = isGulfCountry(senderCountry)
    const isReceiverGulf = isGulfCountry(receiverCountry)
    const isNonGulfToGulf = !isSenderGulf && isReceiverGulf

    // Rule: Item description is required when shipping from non-Gulf to Gulf countries
    if (rules.fields.itemDescription) {
      rules.fields.itemDescription.required = isNonGulfToGulf
      rules.fields.itemDescription.visible = isNonGulfToGulf
      if (rules.fields.itemDescription.validation) {
        rules.fields.itemDescription.validation.required = isNonGulfToGulf
      }
    }

    return NextResponse.json({
      cardName: rules.cardName,
      title: rules.title,
      enabled: true,
      fields: rules.fields,
      shipmentType,
      maxWeight: typeRules.maxWeight,
      maxDimension: typeRules.maxDimension,
      context: {
        senderCountry,
        receiverCountry,
      },
    })
  } catch (error) {
    console.error('Error loading package rules:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل قواعد الطرد' },
      { status: 500 }
    )
  }
}
