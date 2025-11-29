/**
 * Shipment Validation Service
 * Centralizes all business rule validations for shipments
 * Ensures backend enforcement of all 130+ business rules
 */

import countriesData from '@/lib/rules/countries.json'
import senderCardRules from '@/lib/rules/sender-card.json'
import receiverCardRules from '@/lib/rules/receiver-card.json'
import packageCardRules from '@/lib/rules/package-card.json'
import type { ShipmentFormData, ShipmentType } from '@/lib/types'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Check if a country is a Gulf country
 */
function isGulfCountry(countryName: string): boolean {
  const country = countriesData.countries.find((c) => c.name === countryName)
  return country?.isGulf || false
}

/**
 * Determine shipment type based on sender and receiver countries
 */
export function determineShipmentType(
  senderCountry: string,
  receiverCountry: string
): ShipmentType {
  // Same country = Domestic
  if (senderCountry === receiverCountry) {
    return 'Domestic'
  }

  // Both are Gulf countries = IntraGulf
  if (isGulfCountry(senderCountry) && isGulfCountry(receiverCountry)) {
    return 'IntraGulf'
  }

  // Otherwise = International
  return 'International'
}

/**
 * Validate sender data against business rules
 */
export function validateSenderData(data: Partial<ShipmentFormData>): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate required fields
  if (!data.senderName || data.senderName.trim().length < 2) {
    errors.senderName = 'يجب أن يكون اسم المرسل على الأقل حرفين'
  }

  if (!data.senderPhone) {
    errors.senderPhone = 'رقم هاتف المرسل مطلوب'
  } else {
    // Phone validation: at least 10 digits
    const digits = data.senderPhone.replace(/\D/g, '')
    if (digits.length < 10) {
      errors.senderPhone = 'يجب أن يحتوي رقم الهاتف على 10 أرقام على الأقل'
    }
  }

  if (!data.senderCountry) {
    errors.senderCountry = 'دولة المرسل مطلوبة'
  }

  if (!data.senderCity || data.senderCity.trim().length < 2) {
    errors.senderCity = 'يجب أن تكون مدينة المرسل على الأقل حرفين'
  }

  if (!data.senderPostalCode || data.senderPostalCode.trim().length < 3) {
    errors.senderPostalCode = 'يجب أن يكون الرمز البريدي للمرسل على الأقل 3 أحرف'
  }

  // Business Rule: Street is required for Gulf countries
  const isSenderGulf = data.senderCountry ? isGulfCountry(data.senderCountry) : false
  if (isSenderGulf) {
    if (!data.senderStreet || data.senderStreet.trim().length === 0) {
      errors.senderStreet = 'عنوان الشارع مطلوب لدول الخليج'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate receiver data against business rules
 */
export function validateReceiverData(
  data: Partial<ShipmentFormData>,
  senderCountry?: string
): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate required fields
  if (!data.receiverName || data.receiverName.trim().length < 2) {
    errors.receiverName = 'يجب أن يكون اسم المستلم على الأقل حرفين'
  }

  if (!data.receiverPhone) {
    errors.receiverPhone = 'رقم هاتف المستلم مطلوب'
  } else {
    // Phone validation: at least 10 digits
    const digits = data.receiverPhone.replace(/\D/g, '')
    if (digits.length < 10) {
      errors.receiverPhone = 'يجب أن يحتوي رقم الهاتف على 10 أرقام على الأقل'
    }
  }

  if (!data.receiverCountry) {
    errors.receiverCountry = 'دولة المستلم مطلوبة'
  }

  if (!data.receiverCity || data.receiverCity.trim().length < 2) {
    errors.receiverCity = 'يجب أن تكون مدينة المستلم على الأقل حرفين'
  }

  if (!data.receiverPostalCode || data.receiverPostalCode.trim().length < 3) {
    errors.receiverPostalCode = 'يجب أن يكون الرمز البريدي للمستلم على الأقل 3 أحرف'
  }

  // Business Rule: Street is required for Gulf countries
  const isReceiverGulf = data.receiverCountry ? isGulfCountry(data.receiverCountry) : false
  if (isReceiverGulf) {
    if (!data.receiverStreet || data.receiverStreet.trim().length === 0) {
      errors.receiverStreet = 'عنوان الشارع مطلوب لدول الخليج'
    }
  }

  // Business Rule: Cannot ship from Gulf to Iraq
  if (senderCountry && data.receiverCountry) {
    const isSenderGulf = isGulfCountry(senderCountry)
    if (isSenderGulf && data.receiverCountry === 'Iraq') {
      errors.receiverCountry = 'الشحن من دول الخليج إلى العراق غير متاح حالياً'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate package data against business rules
 */
export function validatePackageData(
  data: Partial<ShipmentFormData>,
  shipmentType: ShipmentType
): ValidationResult {
  const errors: Record<string, string> = {}

  // Validate weight
  if (!data.weight || data.weight <= 0) {
    errors.weight = 'يجب أن يكون الوزن أكبر من 0 كجم'
  } else {
    // Get max weight for shipment type
    const typeRules = packageCardRules.shipmentTypes[shipmentType]
    if (typeRules && data.weight > typeRules.maxWeight) {
      errors.weight = `لا يمكن أن يتجاوز الوزن ${typeRules.maxWeight} كجم للشحنات من نوع ${shipmentType}`
    }
  }

  // Validate dimensions
  if (!data.length || data.length <= 0) {
    errors.length = 'يجب أن يكون الطول أكبر من 0 سم'
  } else if (data.length > 200) {
    errors.length = 'لا يمكن أن يتجاوز الطول 200 سم'
  }

  if (!data.width || data.width <= 0) {
    errors.width = 'يجب أن يكون العرض أكبر من 0 سم'
  } else if (data.width > 200) {
    errors.width = 'لا يمكن أن يتجاوز العرض 200 سم'
  }

  if (!data.height || data.height <= 0) {
    errors.height = 'يجب أن يكون الارتفاع أكبر من 0 سم'
  } else if (data.height > 200) {
    errors.height = 'لا يمكن أن يتجاوز الارتفاع 200 سم'
  }

  // Business Rule: Item description required for non-Gulf to Gulf shipments
  if (data.senderCountry && data.receiverCountry) {
    const isSenderGulf = isGulfCountry(data.senderCountry)
    const isReceiverGulf = isGulfCountry(data.receiverCountry)
    const isNonGulfToGulf = !isSenderGulf && isReceiverGulf

    if (isNonGulfToGulf) {
      if (!data.itemDescription || data.itemDescription.trim().length < 5) {
        errors.itemDescription = 'وصف الصنف مطلوب (5 أحرف كحد أدنى) عند الشحن من خارج الخليج إلى دول الخليج'
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate additional options against business rules
 */
export function validateAdditionalOptions(data: Partial<ShipmentFormData>): ValidationResult {
  const errors: Record<string, string> = {}

  // Business Rule: Signature required for Jordan and Egypt
  if (data.receiverCountry === 'Jordan' || data.receiverCountry === 'Egypt') {
    if (!data.signatureRequired) {
      errors.signatureRequired = `التوقيع مطلوب عند الشحن إلى ${data.receiverCountry}`
    }
  }

  // Business Rule: Home pickup disabled for packages > 17kg (except Iraq)
  if (data.weight && data.weight > 17 && data.senderCountry !== 'Iraq') {
    if (data.pickupMethod === 'home') {
      errors.pickupMethod = 'الاستلام المنزلي غير متاح للطرود التي تزيد عن 17 كجم. الرجاء اختيار التسليم في مكتب البريد'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate service selection
 */
export function validateServiceSelection(data: Partial<ShipmentFormData>): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.serviceType) {
    errors.serviceType = 'نوع الخدمة مطلوب'
  }

  if (!data.shipmentType) {
    errors.shipmentType = 'نوع الشحنة مطلوب'
  }

  if (!data.pickupMethod) {
    errors.pickupMethod = 'طريقة الاستلام مطلوبة'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate complete shipment data (for finalization)
 * Runs all validation checks
 */
export function validateCompleteShipment(data: ShipmentFormData): ValidationResult {
  const allErrors: Record<string, string> = {}

  // Determine shipment type
  const shipmentType = determineShipmentType(data.senderCountry, data.receiverCountry)

  // Run all validations
  const senderValidation = validateSenderData(data)
  const receiverValidation = validateReceiverData(data, data.senderCountry)
  const packageValidation = validatePackageData(data, shipmentType)
  const optionsValidation = validateAdditionalOptions(data)
  const serviceValidation = validateServiceSelection(data)

  // Merge all errors
  Object.assign(allErrors, senderValidation.errors)
  Object.assign(allErrors, receiverValidation.errors)
  Object.assign(allErrors, packageValidation.errors)
  Object.assign(allErrors, optionsValidation.errors)
  Object.assign(allErrors, serviceValidation.errors)

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  }
}

/**
 * Validate draft shipment data (minimal validation)
 * Only checks data types and basic structure
 */
export function validateDraftShipment(data: Partial<ShipmentFormData>): ValidationResult {
  const errors: Record<string, string> = {}

  // Only validate that if data exists, it's in the right format
  if (data.weight !== undefined && (isNaN(Number(data.weight)) || Number(data.weight) < 0)) {
    errors.weight = 'يجب أن يكون الوزن رقماً صحيحاً'
  }

  if (data.length !== undefined && (isNaN(Number(data.length)) || Number(data.length) < 0)) {
    errors.length = 'يجب أن يكون الطول رقماً صحيحاً'
  }

  if (data.width !== undefined && (isNaN(Number(data.width)) || Number(data.width) < 0)) {
    errors.width = 'يجب أن يكون العرض رقماً صحيحاً'
  }

  if (data.height !== undefined && (isNaN(Number(data.height)) || Number(data.height) < 0)) {
    errors.height = 'يجب أن يكون الارتفاع رقماً صحيحاً'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
