'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentInfoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [maskedCardNumber, setMaskedCardNumber] = useState('')

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  })

  useEffect(() => {
    loadPaymentInfo()
  }, [])

  const loadPaymentInfo = async () => {
    try {
      const response = await fetch('/api/user/payment-info')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to load payment information')
      }

      const data = await response.json()
      setMaskedCardNumber(data.maskedCardNumber)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment information')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv) {
      setError('All fields are required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/user/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update payment information')
      }

      setSuccess('Payment information updated successfully!')
      setFormData({ cardNumber: '', cardExpiry: '', cardCvv: '' })
      loadPaymentInfo()

      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment information')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Information</h1>
          <p className="mt-2 text-gray-600">
            View and update your saved payment method
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Current Payment Method */}
        {maskedCardNumber && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Current Payment Method</h2>
            <div className="bg-gray-50 p-4 rounded flex items-center">
              <div className="text-3xl mr-4">💳</div>
              <div>
                <p className="font-medium text-lg">{maskedCardNumber}</p>
                <p className="text-sm text-gray-500">Saved card</p>
              </div>
            </div>
          </div>
        )}

        {/* Update Payment Method Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Update Payment Method</h2>
          <p className="text-sm text-gray-600 mb-6">
            For testing, use card: 4111111111111111, CVV: 111, and any future expiry date
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                Card Number *
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                required
                value={formData.cardNumber}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4111111111111111"
                maxLength={16}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                  Expiry Date *
                </label>
                <input
                  id="cardExpiry"
                  name="cardExpiry"
                  type="text"
                  required
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>

              <div>
                <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700">
                  CVV *
                </label>
                <input
                  id="cardCvv"
                  name="cardCvv"
                  type="text"
                  required
                  value={formData.cardCvv}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="111"
                  maxLength={4}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Payment Method'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
