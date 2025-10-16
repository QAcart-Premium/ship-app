'use client'

interface RateBreakdown {
  serviceBase: number
  weightCharge: number
  pickupFee: number
  signatureFee: number
  liquidFee: number
}

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
        disabled ? 'opacity-50' : ''
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Rate</h2>
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
              <span>Service Base</span>
              <span>${rateBreakdown.serviceBase.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Weight Charge</span>
              <span>${rateBreakdown.weightCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Pickup/Drop-off Fee</span>
              <span>${rateBreakdown.pickupFee.toFixed(2)}</span>
            </div>
            {rateBreakdown.signatureFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Signature Required</span>
                <span>${rateBreakdown.signatureFee.toFixed(2)}</span>
              </div>
            )}
            {rateBreakdown.liquidFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Liquid Handling</span>
                <span>${rateBreakdown.liquidFee.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {calculatedPrice === null && (
          <p className="text-sm text-gray-500 text-center py-4">
            Select service to see pricing
          </p>
        )}
      </div>
    </div>
  )
}
