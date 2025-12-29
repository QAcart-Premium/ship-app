'use client'

import { Settings } from 'lucide-react'
import { t } from '@/lib/translations'

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
  const insuranceField = rules?.fields?.insurance
  const packagingField = rules?.fields?.packaging
  const pickupField = rules?.fields?.pickupMethod

  return (
    <div
      className={`bg-muted p-6 rounded-lg shadow border border-border ${
        disabled || !rules ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-primary">{rules?.title || t('form.additionalOptions')}</h2>
      </div>

      {!rules ? (
        <p className="text-sm text-muted-foreground/70 text-center py-4">
          {disabled ? t('form.completePreviousSection') : t('form.loadingOptions')}
        </p>
      ) : (
        <div className="space-y-3">
        {signatureField && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="signatureRequired"
              checked={formData.signatureRequired}
              onChange={(e) => onChange('signatureRequired', e.target.checked)}
              disabled={disabled || !rules || signatureField.disabled}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary disabled:cursor-not-allowed"
              data-testid="signature-required-checkbox"
            />
            <label
              htmlFor="signatureRequired"
              className={`text-sm ${
                signatureField.disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
              }`}
            >
              {signatureField.label}
            </label>
          </div>
        )}
        {liquidField && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="containsLiquid"
              checked={formData.containsLiquid}
              onChange={(e) => onChange('containsLiquid', e.target.checked)}
              disabled={disabled || !rules || liquidField.disabled}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary disabled:cursor-not-allowed"
              data-testid="contains-liquid-checkbox"
            />
            <label
              htmlFor="containsLiquid"
              className={`text-sm ${
                liquidField.disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
              }`}
            >
              {liquidField.label}
            </label>
          </div>
        )}
        {insuranceField && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="insurance"
              checked={formData.insurance}
              onChange={(e) => onChange('insurance', e.target.checked)}
              disabled={disabled || !rules || insuranceField.disabled}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary disabled:cursor-not-allowed"
              data-testid="insurance-checkbox"
            />
            <label
              htmlFor="insurance"
              className={`text-sm ${
                insuranceField.disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
              }`}
            >
              {insuranceField.label}
            </label>
          </div>
        )}
        {packagingField && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="packaging"
              checked={formData.packaging}
              onChange={(e) => onChange('packaging', e.target.checked)}
              disabled={disabled || !rules || packagingField.disabled}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary disabled:cursor-not-allowed"
              data-testid="packaging-checkbox"
            />
            <label
              htmlFor="packaging"
              className={`text-sm ${
                packagingField.disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
              }`}
            >
              {packagingField.label}
            </label>
          </div>
        )}
        {pickupField && (
          <div className="pt-3 border-t border-border">
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              {pickupField.label}
            </label>
            <div className="space-y-2">
              {pickupField?.options?.map((option: any) => {
                const isDisabled =
                  disabled || !rules || pickupField.disabledValues?.includes(option.value)
                return (
                  <div key={option.value} className="flex items-center gap-3">
                    <input
                      type="radio"
                      id={`pickup-${option.value}`}
                      name="pickupMethod"
                      value={option.value}
                      checked={formData.pickupMethod === option.value}
                      onChange={(e) => onChange('pickupMethod', e.target.value)}
                      disabled={isDisabled}
                      className="h-4 w-4 text-primary border-border focus:ring-primary disabled:cursor-not-allowed"
                      data-testid={`pickup-${option.value}-radio`}
                    />
                    <label
                      htmlFor={`pickup-${option.value}`}
                      className={`text-sm ${
                        isDisabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
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
      )}
    </div>
  )
}
