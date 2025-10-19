'use client'

import DynamicCard from '../DynamicCard'
import type { ShipmentType } from '@/lib/types'

interface PackageCardProps {
  rules: any
  formData: Record<string, any>
  errors: Record<string, string>
  onChange: (name: string, value: any) => void
  onBlur?: (name: string) => void
  disabled?: boolean
  shipmentType?: ShipmentType | null
}

export default function PackageCard({
  rules,
  formData,
  errors,
  onChange,
  onBlur,
  disabled = false,
  shipmentType,
}: PackageCardProps) {
  return (
    <DynamicCard
      rules={rules}
      formData={formData}
      errors={errors}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      shipmentType={shipmentType || undefined}
      cardTitle="Package Details"
    />
  )
}
