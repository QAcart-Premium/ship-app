'use client'

import { Save, CheckCircle } from 'lucide-react'
import SenderCard from './cards/SenderCard'
import ReceiverCard from './cards/ReceiverCard'
import PackageCard from './cards/PackageCard'
import ServiceSelectionCard from './cards/ServiceSelectionCard'
import AdditionalOptionsCard from './cards/AdditionalOptionsCard'
import RateCard from './cards/RateCard'
import { useShipmentForm } from '@/hooks/useShipmentForm'
import { t } from '@/lib/translations'

interface ShipmentFormProps {
  editId?: string | null
  repeatId?: string | null
}

export default function ShipmentForm({ editId, repeatId }: ShipmentFormProps) {
  const {
    loading,
    errors,
    formData,
    isEditMode,
    senderRules,
    receiverRules,
    packageRules,
    serviceRules,
    additionalOptionsRules,
    senderCompleted,
    receiverCompleted,
    packageCompleted,
    shipmentType,
    selectedService,
    calculatedPrice,
    rateBreakdown,
    handleFieldChange,
    handleFieldBlur,
    handleServiceSelect,
    handleSubmit,
  } = useShipmentForm(editId, repeatId)

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
      {/* General error message */}
      {errors.general && (
        <div
          className="bg-nord-aurora-red/20 border border-destructive text-destructive px-4 py-3 rounded mb-8"
          data-testid="error-message"
        >
          {errors.general}
        </div>
      )}

      {/* Payment error message */}
      {errors.payment && (
        <div
          className="bg-nord-aurora-red/20 border border-destructive text-destructive px-4 py-3 rounded mb-8"
          data-testid="payment-error-message"
        >
          {errors.payment}
        </div>
      )}

      {/* Two Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Left Column - Address & Package */}
        <div className="lg:col-span-3 space-y-6">
          <SenderCard
            rules={senderRules}
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            disabled={true}
          />

          <ReceiverCard
            rules={receiverRules}
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            disabled={!senderCompleted}
          />

          <PackageCard
            rules={packageRules}
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            disabled={!receiverCompleted}
            shipmentType={shipmentType}
          />
        </div>

        {/* Right Column - Service & Rate */}
        <div className="lg:col-span-2 space-y-6">
          <ServiceSelectionCard
            serviceRules={serviceRules}
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
            disabled={!packageCompleted}
          />

          <AdditionalOptionsCard
            rules={additionalOptionsRules}
            formData={formData}
            onChange={handleFieldChange}
            disabled={!packageCompleted}
          />

          <RateCard
            calculatedPrice={calculatedPrice}
            rateBreakdown={rateBreakdown}
            disabled={!packageCompleted}
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading || !packageCompleted}
          data-testid="save-draft-button"
          className="flex items-center gap-2 px-6 py-2 border border-primary text-primary rounded-md hover:bg-nord-frost-1/20 disabled:bg-nord-polar-3 disabled:text-muted-foreground/50 disabled:cursor-not-allowed disabled:border-border transition-colors"
        >
          <Save className="w-4 h-4" />
          {loading ? t('form.saving') : (isEditMode ? t('common.save') : t('form.saveDraft'))}
        </button>
        <button
          type="submit"
          onClick={(e) => handleSubmit(e, false)}
          disabled={loading || !selectedService || !calculatedPrice}
          data-testid="finalize-button"
          className="flex items-center gap-2 px-6 py-2 bg-primary text-nord-polar-0 rounded-md hover:bg-nord-frost-3 disabled:bg-nord-polar-3 disabled:cursor-not-allowed transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          {loading ? t('form.finalizing') : t('form.finalizeShipment')}
        </button>
      </div>
    </form>
  )
}
