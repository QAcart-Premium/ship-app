'use client'

import { User, Users, Package, CheckCircle } from 'lucide-react'
import type { CardRules, FieldRule } from '@/lib/types'
import { t } from '@/lib/translations'

interface DynamicCardProps {
  rules: CardRules | null
  formData: Record<string, any>
  errors: Record<string, string>
  onChange: (name: string, value: any) => void
  onBlur?: (name: string) => void
  disabled?: boolean
  shipmentType?: string
  cardTitle?: string
}

export default function DynamicCard({
  rules,
  formData,
  errors,
  onChange,
  onBlur,
  disabled = false,
  shipmentType,
  cardTitle,
}: DynamicCardProps) {
  const renderField = (fieldName: string, field: FieldRule) => {
    const value = formData[fieldName] || ''
    const error = errors[fieldName]
    const isDisabled = disabled || field.disabled

    const baseInputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500' : 'border-gray-300'
    } ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`

    switch (field.type) {
      case 'text':
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label} {field.required && '*'}
            </label>
            <input
              type="text"
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={(e) => onChange(fieldName, e.target.value)}
              onBlur={() => onBlur && onBlur(fieldName)}
              placeholder={field.placeholder}
              disabled={isDisabled}
              data-testid={`${fieldName}-input`}
              className={baseInputClass}
              aria-required={field.required}
              aria-invalid={!!error}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600" data-testid={`${fieldName}-error`}>
                {error}
              </p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label} {field.required && '*'}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={(e) => onChange(fieldName, e.target.value)}
              onBlur={() => onBlur && onBlur(fieldName)}
              disabled={isDisabled}
              data-testid={`${fieldName}-select`}
              className={baseInputClass}
              aria-required={field.required}
            >
              <option value="">{field.placeholder || 'Select...'}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <p className="mt-1 text-sm text-red-600" data-testid={`${fieldName}-error`}>
                {error}
              </p>
            )}
          </div>
        )

      case 'number':
        return (
          <div key={fieldName}>
            <label
              htmlFor={fieldName}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label} {field.required && '*'}
              {field.validation?.max && (
                <span className="ml-2 text-xs text-gray-500">
                  (Max: {field.validation.max})
                </span>
              )}
            </label>
            <input
              type="number"
              id={fieldName}
              name={fieldName}
              value={value}
              onChange={(e) => onChange(fieldName, e.target.value)}
              onBlur={() => onBlur && onBlur(fieldName)}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              step="0.1"
              disabled={isDisabled}
              data-testid={`${fieldName}-input`}
              className={baseInputClass}
              aria-required={field.required}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600" data-testid={`${fieldName}-error`}>
                {error}
              </p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div key={fieldName} className="flex items-center">
            <input
              type="checkbox"
              id={fieldName}
              name={fieldName}
              checked={!!value}
              onChange={(e) => onChange(fieldName, e.target.checked)}
              disabled={isDisabled}
              data-testid={`${fieldName}-checkbox`}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <label
              htmlFor={fieldName}
              className={`ml-2 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}
            >
              {field.label}
            </label>
          </div>
        )

      default:
        return null
    }
  }

  // Determine grid layout based on field count and types
  // Filter out fields that are not visible (visible is undefined or true)
  const fieldEntries = rules ? Object.entries(rules.fields).filter(
    ([_, field]) => field.visible !== false
  ) : []

  // Determine icon based on card title
  const getIcon = () => {
    const title = rules?.title?.toLowerCase() || ''
    if (title.includes('sender')) return <User className="w-5 h-5 text-blue-600" />
    if (title.includes('receiver')) return <Users className="w-5 h-5 text-blue-600" />
    if (title.includes('package')) return <Package className="w-5 h-5 text-blue-600" />
    return <CheckCircle className="w-5 h-5 text-blue-600" />
  }

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow ${
        disabled || !rules ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h2 className="text-xl font-semibold">{rules?.title || cardTitle || 'Loading...'}</h2>
        </div>
        {shipmentType && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {shipmentType}
          </span>
        )}
      </div>

      {!rules ? (
        <p className="text-sm text-gray-400 text-center py-4">
          {disabled ? t('form.completePreviousSection') : t('form.loadingCard')}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldEntries.map(([fieldName, field]) => {
            const isFullWidth =
              fieldName.includes('Street') ||
              fieldName.includes('Country') ||
              fieldName.includes('Description')

            return (
              <div
                key={fieldName}
                className={isFullWidth ? 'md:col-span-2' : ''}
              >
                {renderField(fieldName, field)}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
