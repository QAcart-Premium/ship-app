'use client'

import { useState } from 'react'

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  rateBreakdown: {
    serviceBase: number
    weightCharge: number
    pickupFee: number
    signatureFee: number
    liquidFee: number
  } | null
  totalPrice: number | null
  maskedCardNumber: string
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  rateBreakdown,
  totalPrice,
  maskedCardNumber,
}: PaymentConfirmationModalProps) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setProcessing(true)
    setError(null)

    try {
      await onConfirm()
      // onConfirm will handle navigation on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Confirm Payment</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Rate Breakdown */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Price Breakdown</h3>
          <div className="space-y-2 text-sm">
            {rateBreakdown && (
              <>
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
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">
                    ${totalPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Payment Method</h3>
          <div className="bg-gray-50 p-3 rounded flex items-center">
            <div className="text-2xl mr-3">💳</div>
            <div>
              <p className="font-medium">{maskedCardNumber}</p>
              <p className="text-xs text-gray-500">Saved payment method</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}
