import { NextRequest, NextResponse } from 'next/server'
import receiverCardRules from '@/lib/rules/receiver-card.json'
import countriesData from '@/lib/rules/countries.json'

/**
 * POST /api/rules/receiver
 * Returns the rules for the receiver card
 *
 * Request body:
 * - formData: The current form data to validate and adjust rules
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData } = body
    const senderCountry = formData?.senderCountry
    const receiverCountry = formData?.receiverCountry

    // Load the receiver card rules
    const rules = JSON.parse(JSON.stringify(receiverCardRules))

    // Build country options (always show all countries)
    const countryOptions = countriesData.countries.map((country) => ({
      value: country.name,
      label: country.name,
    }))

    // Update the receiverCountry field with options
    if (rules.fields.receiverCountry) {
      rules.fields.receiverCountry.options = countryOptions
    }

    // Check if receiver country is a Gulf country
    const receiverCountryData = countriesData.countries.find(
      (c) => c.name === receiverCountry
    )
    const isReceiverGulfCountry = receiverCountryData?.isGulf || false

    // Rule: Street address is optional for non-Gulf countries, required for Gulf countries
    if (rules.fields.receiverStreet) {
      rules.fields.receiverStreet.required = isReceiverGulfCountry
      if (rules.fields.receiverStreet.validation) {
        rules.fields.receiverStreet.validation.required = isReceiverGulfCountry
      }
    }

    // Check if sender country is a Gulf country
    const senderCountryDataForValidation = countriesData.countries.find(
      (c) => c.name === senderCountry
    )
    const isSenderGulf = senderCountryDataForValidation?.isGulf || false

    // Build validation errors object
    const validationErrors: Record<string, string> = {}

    // Rule: Cannot ship from Gulf countries to Iraq
    if (isSenderGulf && receiverCountry === 'Iraq') {
      validationErrors.receiverCountry = 'Shipping from Gulf countries to Iraq is currently not possible'
    }

    return NextResponse.json({
      ...rules,
      enabled: true, // Enable the card when rules are fetched
      validationErrors, // Add validation errors
      context: {
        senderCountry,
        receiverCountry,
      },
    })
  } catch (error) {
    console.error('Error loading receiver rules:', error)
    return NextResponse.json(
      { error: 'Failed to load receiver rules' },
      { status: 500 }
    )
  }
}
