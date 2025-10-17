'use client'

import type { ServiceOption } from '@/lib/types'

interface ServiceSelectionCardProps {
  serviceRules: any
  selectedService: ServiceOption | null
  onServiceSelect: (service: ServiceOption) => void
  disabled?: boolean
}

export default function ServiceSelectionCard({
  serviceRules,
  selectedService,
  onServiceSelect,
  disabled = false,
}: ServiceSelectionCardProps) {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Service Selection</h2>

      {serviceRules && (
        <div className="space-y-3">
          {serviceRules.services.map((service: ServiceOption) => (
            <button
              key={service.id}
              type="button"
              onClick={() => onServiceSelect(service)}
              disabled={disabled}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                selectedService?.id === service.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              } ${disabled ? 'cursor-not-allowed' : ''}`}
              data-testid={`service-${service.id}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-900">
                  {service.name}
                </span>
                <span className="text-sm text-gray-600">
                  {service.deliveryDays} {service.deliveryDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {service.description}
              </p>
              <div className="text-xs text-gray-500">
                Base: ${service.basePrice} + ${service.pricePerKg}/kg
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
