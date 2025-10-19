'use client'

import { DollarSign } from 'lucide-react'
import { RateBreakdown } from '@/lib/types'

interface RateCardProps {
  calculatedPrice: number | null
  rateBreakdown: RateBreakdown | null
  disabled?: boolean
}

export default function RateCard({
  calculatedPrice,
  rateBreakdown,
  disabled = false,
}: RateCardProps) {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow ${
        disabled || calculatedPrice === null ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Rate</h2>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
          <span className="text-lg font-medium text-gray-700">Total Price</span>
          <span
            className="text-2xl font-bold text-blue-600"
            data-testid="total-price"
          >
            {calculatedPrice !== null ? `$${calculatedPrice.toFixed(2)}` : '-'}
          </span>
        </div>

        {rateBreakdown && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Base Shipping Cost</span>
              <span>${rateBreakdown.baseCost.toFixed(2)}</span>
            </div>
            {rateBreakdown.signatureCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Signature Required</span>
                <span>${rateBreakdown.signatureCost.toFixed(2)}</span>
              </div>
            )}
            {rateBreakdown.insuranceCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Insurance</span>
                <span>${rateBreakdown.insuranceCost.toFixed(2)}</span>
              </div>
            )}
            {rateBreakdown.packagingCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Professional Packaging</span>
                <span>${rateBreakdown.packagingCost.toFixed(2)}</span>
              </div>
            )}
            {rateBreakdown.liquidCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Liquid Handling</span>
                <span>${rateBreakdown.liquidCost.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {calculatedPrice === null && (
          <p className="text-sm text-gray-400 text-center py-4">
            {disabled ? 'Complete the previous section to unlock this card' : 'Select a service to see pricing'}
          </p>
        )}
      </div>
    </div>
  )
}
