'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Copy, Trash2, Edit } from 'lucide-react'
import DeleteModal from '@/components/shipments/DeleteModal'
import type { Shipment } from '@/lib/types'

export default function ShipmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const shipmentId = params.id as string

  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [finalizing, setFinalizing] = useState(false)

  useEffect(() => {
    loadShipment()
  }, [shipmentId])

  const loadShipment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/shipments/${shipmentId}`)

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        if (response.status === 404) {
          setError('Shipment not found')
          return
        }
        throw new Error('Failed to load shipment')
      }

      const data = await response.json()
      setShipment(data.shipment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shipment')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (!shipment) return

    setFinalizing(true)
    try {
      const response = await fetch(`/api/shipments/${shipment.id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to finalize shipment')
      }

      // Redirect to shipments list
      router.push('/shipments')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize shipment')
    } finally {
      setFinalizing(false)
    }
  }

  const handleDelete = async () => {
    if (!shipment) return

    try {
      const response = await fetch(`/api/shipments/${shipment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete shipment')
      }

      router.push('/shipments')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shipment')
      setShowDeleteModal(false)
    }
  }

  const handleRepeat = () => {
    if (!shipment) return
    router.push(`/?repeat=${shipment.id}`)
  }

  const getStatusBadge = (status: string) => {
    if (status === 'draft') {
      return (
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
          DRAFT
        </span>
      )
    }
    // All non-draft statuses are "finalized"
    return (
      <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
        FINALIZED
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading shipment...</div>
      </div>
    )
  }

  if (error || !shipment) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {error || 'Shipment not found'}
        </div>
        <Link
          href="/shipments"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Shipments
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/shipments"
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
        >
          ← Back to Shipments
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {shipment.status === 'draft' ? `Draft Shipment #${shipment.id}` : shipment.trackingNumber}
            </h1>
            <p className="mt-2 text-gray-600">
              Created {new Date(shipment.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(shipment.status)}
            {shipment.status === 'draft' ? (
              <>
                <Link
                  href={`/?edit=${shipment.id}`}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-600 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={handleFinalize}
                  disabled={finalizing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {finalizing ? 'Finalizing...' : 'Finalize Shipment'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-6 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRepeat}
                  className="flex items-center gap-2 px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Repeat
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-6 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sender Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Sender Information</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium text-gray-900">{shipment.from.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="font-medium text-gray-900">{shipment.from.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="font-medium text-gray-900">
                {shipment.from.street}<br />
                {shipment.from.city}, {shipment.from.postalCode}<br />
                {shipment.from.country}
              </div>
            </div>
          </div>
        </div>

        {/* Receiver Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Receiver Information</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium text-gray-900">{shipment.to.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="font-medium text-gray-900">{shipment.to.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="font-medium text-gray-900">
                {shipment.to.street}<br />
                {shipment.to.city}, {shipment.to.postalCode}<br />
                {shipment.to.country}
              </div>
            </div>
          </div>
        </div>

        {/* Package Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Package Details</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Shipment Type</div>
              <div className="font-medium text-gray-900">{shipment.service.shipmentType}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Weight</div>
              <div className="font-medium text-gray-900">{shipment.package.weight} kg</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Dimensions (L × W × H)</div>
              <div className="font-medium text-gray-900">
                {shipment.package.length} × {shipment.package.width} × {shipment.package.height} cm
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Content Description</div>
              <div className="font-medium text-gray-900">{shipment.package.description}</div>
            </div>
          </div>
        </div>

        {/* Service & Options */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Service & Options</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Service Type</div>
              <div className="font-medium text-gray-900">{shipment.service.type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Pickup Method</div>
              <div className="font-medium text-gray-900">
                {shipment.service.pickupMethod === 'home' ? 'Home Pickup' : 'Postal Office Drop-off'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Additional Options</div>
              <div className="space-y-1">
                {shipment.options.insurance && (
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Insurance
                  </div>
                )}
                {shipment.options.signature && (
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Signature Required
                  </div>
                )}
                {shipment.options.packaging && (
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Professional Packaging
                  </div>
                )}
                {shipment.options.liquid && (
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Contains Liquid
                  </div>
                )}
                {!shipment.options.insurance && !shipment.options.signature && !shipment.options.packaging && !shipment.options.liquid && (
                  <div className="text-sm text-gray-500">No additional options selected</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Cost Breakdown</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Shipping Cost</span>
            <span className="font-medium text-gray-900">${shipment.rate.base?.toFixed(2) || '0.00'}</span>
          </div>
          {shipment.rate.insurance > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Insurance</span>
              <span className="font-medium text-gray-900">${shipment.rate.insurance.toFixed(2)}</span>
            </div>
          )}
          {shipment.rate.signature > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Signature Required</span>
              <span className="font-medium text-gray-900">${shipment.rate.signature.toFixed(2)}</span>
            </div>
          )}
          {shipment.rate.packaging > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Professional Packaging</span>
              <span className="font-medium text-gray-900">${shipment.rate.packaging.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total Cost</span>
              <span className="text-lg font-bold text-blue-600">${shipment.rate.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        shipmentId={shipment.id}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
