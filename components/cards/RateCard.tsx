'use client'

import { DollarSign } from 'lucide-react'
import { RateBreakdown } from '@/lib/types'
import { t } from '@/lib/translations'

interface RateCardProps {
  calculatedPrice: number | null
  rateBreakdown: RateBreakdown | null
  disabled?: boolean
}

export default function RateCard({
  calculatedPrice,
  rateBreakdown,
  disabled = false,
}: RateCardProps) {
  return (
    <div
      className={`bg-muted p-6 rounded-lg shadow border border-border ${
        disabled || calculatedPrice === null ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-primary">{t('form.rate')}</h2>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-t border-b border-border">
          <span className="text-lg font-medium text-muted-foreground">{t('rate.totalPrice')}</span>
          <span
            className="text-2xl font-bold text-primary"
            data-testid="total-price"
          >
            {calculatedPrice !== null ? `$${calculatedPrice.toFixed(2)}` : '-'}
          </span>
        </div>

        {rateBreakdown && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t('rate.baseShippingCost')}</span>
              <span>${rateBreakdown.baseCost.toFixed(2)}</span>
            </div>
            {rateBreakdown.signatureCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t('rate.signatureRequired')}</span>
                <span>${rateBreakdown.signatureCost.toFixed(2)}</span>
              </div>
            )}
            {rateBreakdown.insuranceCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t('rate.insurance')}</span>
                <span>${rateBreakdown.insuranceCost.toFixed(2)}</span>
              </div>
            )}
            {rateBreakdown.packagingCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t('rate.packaging')}</span>
                <span>${rateBreakdown.packagingCost.toFixed(2)}</span>
              </div>
            )}
            {rateBreakdown.liquidCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t('rate.liquidHandling')}</span>
                <span>${rateBreakdown.liquidCost.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {calculatedPrice === null && (
          <p className="text-sm text-muted-foreground/70 text-center py-4">
            {disabled ? t('form.completePreviousSection') : t('form.selectServiceToSeePricing')}
          </p>
        )}
      </div>
    </div>
  )
}
