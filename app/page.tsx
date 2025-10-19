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
          {isEditMode ? 'تعديل الشحنة' : isRepeatMode ? 'تكرار الشحنة' : 'إنشاء شحنة جديدة'}
        </h1>
        <p className="text-gray-600">
          {isEditMode
            ? 'قم بتحديث تفاصيل الشحنة أدناه'
            : isRepeatMode
            ? 'راجع وعدّل تفاصيل الشحنة أدناه'
            : 'املأ تفاصيل الشحنة أدناه'}
        </p>
      </div>
      <ShipmentForm editId={editId} repeatId={repeatId} />
    </div>
  )
}
