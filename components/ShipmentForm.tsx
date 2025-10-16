'use client'

import SenderCard from './cards/SenderCard'
import ReceiverCard from './cards/ReceiverCard'
import PackageCard from './cards/PackageCard'
import ServiceSelectionCard from './cards/ServiceSelectionCard'
import AdditionalOptionsCard from './cards/AdditionalOptionsCard'
import RateCard from './cards/RateCard'
import PaymentConfirmationModal from './PaymentConfirmationModal'
import { useShipmentForm } from '@/hooks/useShipmentForm'

export default function ShipmentForm() {
  const {
    loading,
    errors,
    successMessage,
    formData,
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
    showPaymentModal,
    setShowPaymentModal,
    maskedCardNumber,
    handleFieldChange,
    handleFieldBlur,
    handleServiceSelect,
    handleSubmit,
    handlePaymentConfirm,
  } = useShipmentForm()

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
      {/* Success message */}
      {successMessage && (
        <div
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-8"
          data-testid="success-message"
        >
          {successMessage}
        </div>
      )}

      {/* General error message */}
      {errors.general && (
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-8"
          data-testid="error-message"
        >
          {errors.general}
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
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading || !packageCompleted}
          data-testid="save-draft-button"
          className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-400"
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="submit"
          onClick={(e) => handleSubmit(e, false)}
          disabled={loading || !selectedService || !calculatedPrice}
          data-testid="finalize-button"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Finalizing...' : 'Finalize Shipment'}
        </button>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        rateBreakdown={rateBreakdown}
        totalPrice={calculatedPrice}
        maskedCardNumber={maskedCardNumber}
      />
    </form>
  )
}
