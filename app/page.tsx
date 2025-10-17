'use client'

import { useSearchParams } from 'next/navigation'
import ShipmentForm from '@/components/ShipmentForm'

export default function HomePage() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const repeatId = searchParams.get('repeat')
  const isEditMode = !!editId
  const isRepeatMode = !!repeatId

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
          {isEditMode ? 'Edit Shipment' : isRepeatMode ? 'Repeat Shipment' : 'Create New Shipment'}
        </h1>
        <p className="text-gray-600">
          {isEditMode
            ? 'Update the shipment details below'
            : isRepeatMode
            ? 'Review and modify the shipment details below'
            : 'Fill in the shipment details below'}
        </p>
      </div>
      <ShipmentForm editId={editId} repeatId={repeatId} />
    </div>
  )
}
