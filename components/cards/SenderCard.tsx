'use client'

import DynamicCard from '../DynamicCard'
import type { CardRules } from '@/lib/types'

interface SenderCardProps {
  rules: CardRules | null
  formData: Record<string, any>
  errors: Record<string, string>
  onChange: (name: string, value: any) => void
  onBlur?: (name: string) => void
  disabled?: boolean
}

export default function SenderCard({
  rules,
  formData,
  errors,
  onChange,
  onBlur,
  disabled = false,
}: SenderCardProps) {
  return (
    <DynamicCard
      rules={rules}
      formData={formData}
      errors={errors}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      cardTitle="Sender Information"
    />
  )
}
