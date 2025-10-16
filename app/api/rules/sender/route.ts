import { NextRequest, NextResponse } from 'next/server'
import senderCardRules from '@/lib/rules/sender-card.json'
import countriesData from '@/lib/rules/countries.json'

/**
 * POST /api/rules/sender
 * Returns the rules for the sender card
 *
 * Request body:
 * - formData: The current form data to validate and adjust rules
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData } = body
    const senderCountry = formData?.senderCountry

    // Load the sender card rules
    const rules = JSON.parse(JSON.stringify(senderCardRules))

    // Add country options to the senderCountry field
    const countryOptions = countriesData.countries.map((country) => ({
      value: country.name,
      label: country.name,
    }))

    // Update the senderCountry field with options
    if (rules.fields.senderCountry) {
      rules.fields.senderCountry.options = countryOptions
    }

    // Check if sender country is a Gulf country
    const senderCountryData = countriesData.countries.find(
      (c) => c.name === senderCountry
    )
    const isGulfCountry = senderCountryData?.isGulf || false

    // Rule: Street address is optional for non-Gulf countries, required for Gulf countries
    if (rules.fields.senderStreet) {
      rules.fields.senderStreet.required = isGulfCountry
      if (rules.fields.senderStreet.validation) {
        rules.fields.senderStreet.validation.required = isGulfCountry
      }
    }

    return NextResponse.json(rules)
  } catch (error) {
    console.error('Error loading sender rules:', error)
    return NextResponse.json(
      { error: 'Failed to load sender rules' },
      { status: 500 }
    )
  }
}
