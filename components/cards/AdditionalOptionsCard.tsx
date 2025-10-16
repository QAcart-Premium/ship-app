'use client'

interface AdditionalOptionsCardProps {
  rules: any
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
  disabled?: boolean
}

export default function AdditionalOptionsCard({
  rules,
  formData,
  onChange,
  disabled = false,
}: AdditionalOptionsCardProps) {
  // Show disabled state when rules are not loaded yet
  const signatureField = rules?.fields?.signatureRequired
  const liquidField = rules?.fields?.containsLiquid
  const pickupField = rules?.fields?.pickupMethod

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow ${
        disabled || !rules ? 'opacity-50' : ''
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">{rules?.title || 'Additional Options'}</h2>
      <div className="space-y-3">
        {signatureField && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="signatureRequired"
              checked={formData.signatureRequired}
              onChange={(e) => onChange('signatureRequired', e.target.checked)}
              disabled={disabled || !rules || signatureField.disabled}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
              data-testid="signature-required-checkbox"
            />
            <label
              htmlFor="signatureRequired"
              className={`ml-2 text-sm ${
                signatureField.disabled ? 'text-gray-500' : 'text-gray-700'
              }`}
            >
              {signatureField.label}
            </label>
          </div>
        )}
        {liquidField && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="containsLiquid"
              checked={formData.containsLiquid}
              onChange={(e) => onChange('containsLiquid', e.target.checked)}
              disabled={disabled || !rules || liquidField.disabled}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
              data-testid="contains-liquid-checkbox"
            />
            <label
              htmlFor="containsLiquid"
              className={`ml-2 text-sm ${
                liquidField.disabled ? 'text-gray-500' : 'text-gray-700'
              }`}
            >
              {liquidField.label}
            </label>
          </div>
        )}
        {pickupField && (
          <div className="pt-3 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {pickupField.label}
            </label>
            <div className="space-y-2">
              {pickupField?.options?.map((option: any) => {
                const isDisabled =
                  disabled || !rules || pickupField.disabledValues?.includes(option.value)
                return (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`pickup-${option.value}`}
                      name="pickupMethod"
                      value={option.value}
                      checked={formData.pickupMethod === option.value}
                      onChange={(e) => onChange('pickupMethod', e.target.value)}
                      disabled={isDisabled}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
                      data-testid={`pickup-${option.value}-radio`}
                    />
                    <label
                      htmlFor={`pickup-${option.value}`}
                      className={`ml-2 text-sm ${
                        isDisabled ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
