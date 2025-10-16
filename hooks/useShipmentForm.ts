import { useState, useEffect } from 'react'
import type { CardRules, ServiceOption, ShipmentType } from '@/lib/rules/types'

export function useShipmentForm() {
  // State
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Card rules
  const [senderRules, setSenderRules] = useState<CardRules | null>(null)
  const [receiverRules, setReceiverRules] = useState<CardRules | null>(null)
  const [packageRules, setPackageRules] = useState<any>(null)
  const [serviceRules, setServiceRules] = useState<any>(null)
  const [additionalOptionsRules, setAdditionalOptionsRules] = useState<any>(null)

  // Card completion tracking
  const [senderCompleted, setSenderCompleted] = useState(false)
  const [receiverCompleted, setReceiverCompleted] = useState(false)
  const [packageCompleted, setPackageCompleted] = useState(false)

  // Shipment data
  const [shipmentType, setShipmentType] = useState<ShipmentType | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [rateBreakdown, setRateBreakdown] = useState<any>(null)

  // Form data
  const [formData, setFormData] = useState<Record<string, any>>({
    senderName: '',
    senderPhone: '',
    senderCountry: '',
    senderCity: '',
    senderStreet: '',
    senderPostalCode: '',
    receiverName: '',
    receiverPhone: '',
    receiverCountry: '',
    receiverCity: '',
    receiverStreet: '',
    receiverPostalCode: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    itemDescription: '',
    serviceType: '',
    signatureRequired: false,
    containsLiquid: false,
    pickupMethod: 'home',
  })

  // API Loaders
  const loadSenderRules = async () => {
    try {
      const response = await fetch('/api/rules/sender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      })
      const rules = await response.json()
      setSenderRules(rules)
    } catch (error) {
      console.error('Error loading sender rules:', error)
    }
  }

  const loadReceiverRules = async () => {
    try {
      const response = await fetch('/api/rules/receiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      })
      const rules = await response.json()
      setReceiverRules(rules)

      if (rules.validationErrors && Object.keys(rules.validationErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...rules.validationErrors }))
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev }
          Object.keys(newErrors).forEach((key) => {
            if (newErrors[key] === 'Shipping from Gulf countries to Iraq is currently not possible') {
              delete newErrors[key]
            }
          })
          return newErrors
        })
      }
    } catch (error) {
      console.error('Error loading receiver rules:', error)
    }
  }

  const loadPackageRules = async () => {
    try {
      const response = await fetch('/api/rules/package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      })
      const rules = await response.json()
      setPackageRules(rules)
      setShipmentType(rules.shipmentType)
    } catch (error) {
      console.error('Error loading package rules:', error)
    }
  }

  const loadServiceRules = async () => {
    try {
      const response = await fetch('/api/rules/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentType, formData }),
      })
      const rules = await response.json()
      setServiceRules(rules)
    } catch (error) {
      console.error('Error loading service rules:', error)
    }
  }

  const loadAdditionalOptionsRules = async () => {
    try {
      const response = await fetch('/api/rules/additional-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      })
      const rules = await response.json()
      setAdditionalOptionsRules(rules)

      // Auto-apply rules
      if (rules.fields?.signatureRequired?.checked) {
        setFormData((prev) => ({ ...prev, signatureRequired: true }))
      }
      if (
        rules.fields?.pickupMethod?.defaultValue &&
        rules.fields?.pickupMethod?.disabledValues?.includes(formData.pickupMethod)
      ) {
        setFormData((prev) => ({
          ...prev,
          pickupMethod: rules.fields.pickupMethod.defaultValue,
        }))
      }
    } catch (error) {
      console.error('Error loading additional options rules:', error)
    }
  }

  const loadRate = async () => {
    if (!selectedService) return

    try {
      const response = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          weight: parseFloat(formData.weight),
          senderCountry: formData.senderCountry,
          receiverCountry: formData.receiverCountry,
          pickupMethod: formData.pickupMethod,
          signatureRequired: formData.signatureRequired,
          containsLiquid: formData.containsLiquid,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate rate')
      }

      const data = await response.json()
      setCalculatedPrice(data.totalPrice)
      setRateBreakdown(data.breakdown)
    } catch (error) {
      console.error('Error calculating rate:', error)
      setCalculatedPrice(null)
      setRateBreakdown(null)
    }
  }

  // Validation helpers
  const checkCardComplete = (rules: CardRules, data: Record<string, any>): boolean => {
    return Object.entries(rules.fields).every(([fieldName, field]) => {
      if (!field.required) return true
      const value = data[fieldName]
      if (typeof value === 'string') return value.trim().length > 0
      return value !== null && value !== undefined && value !== ''
    })
  }

  const checkPackageComplete = (): boolean => {
    const requiredFields = ['weight', 'length', 'width', 'height']
    return requiredFields.every((field) => {
      const value = formData[field]
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    })
  }

  const validateField = (fieldName: string, fieldRule: any, value: any): string | null => {
    // Required validation
    if (fieldRule.required) {
      if (typeof value === 'string' && value.trim() === '') {
        return fieldRule.validation?.errorMessage || 'This field is required'
      }
      if (value === null || value === undefined || value === '') {
        return fieldRule.validation?.errorMessage || 'This field is required'
      }
    }

    // MinLength validation
    if (fieldRule.validation?.minLength && value) {
      if (value.length < fieldRule.validation.minLength) {
        return `Minimum ${fieldRule.validation.minLength} characters required`
      }
    }

    // MaxLength validation
    if (fieldRule.validation?.maxLength && value) {
      if (value.length > fieldRule.validation.maxLength) {
        return `Maximum ${fieldRule.validation.maxLength} characters allowed`
      }
    }

    // Pattern validation
    if (fieldRule.validation?.pattern && value) {
      const regex = new RegExp(fieldRule.validation.pattern)
      if (!regex.test(value)) {
        return fieldRule.validation?.errorMessage || 'Invalid format'
      }
    }

    // Number validations
    if (fieldRule.type === 'number' && value) {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return 'Please enter a valid number'
      if (fieldRule.validation?.min !== undefined && numValue < fieldRule.validation.min) {
        return `Value must be at least ${fieldRule.validation.min}`
      }
      if (fieldRule.validation?.max !== undefined && numValue > fieldRule.validation.max) {
        return `Value cannot exceed ${fieldRule.validation.max}`
      }
    }

    return null
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate sender
    if (senderRules) {
      Object.entries(senderRules.fields).forEach(([fieldName, field]) => {
        if (field.required && !formData[fieldName]) {
          newErrors[fieldName] = field.validation?.errorMessage || 'Required'
        }
      })
    }

    // Validate receiver
    if (receiverRules) {
      Object.entries(receiverRules.fields).forEach(([fieldName, field]) => {
        if (field.required && !formData[fieldName]) {
          newErrors[fieldName] = field.validation?.errorMessage || 'Required'
        }
      })
      if (receiverRules.validationErrors) {
        Object.assign(newErrors, receiverRules.validationErrors)
      }
    }

    // Validate package
    if (packageRules) {
      const weight = parseFloat(formData.weight)
      if (isNaN(weight) || weight <= 0) {
        newErrors.weight = 'Valid weight is required'
      } else if (weight > packageRules.maxWeight) {
        newErrors.weight = `Weight cannot exceed ${packageRules.maxWeight}kg for ${shipmentType} shipments`
      }
    }

    // Validate service selected
    if (!selectedService) {
      newErrors.service = 'Please select a service'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handlers
  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }

  const handleFieldBlur = (fieldName: string) => {
    const allRules: Record<string, any> = {}
    if (senderRules?.fields) Object.assign(allRules, senderRules.fields)
    if (receiverRules?.fields) Object.assign(allRules, receiverRules.fields)
    if (packageRules?.fields) Object.assign(allRules, packageRules.fields)

    const fieldRule = allRules[fieldName]
    if (!fieldRule) return

    const value = formData[fieldName]
    const error = validateField(fieldName, fieldRule, value)

    if (error) {
      setErrors((prev) => ({ ...prev, [fieldName]: error }))
    } else {
      // Don't clear API validation errors
      if (fieldName === 'receiverCountry' && receiverRules?.validationErrors?.[fieldName]) {
        return
      }
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleServiceSelect = (service: ServiceOption) => {
    setSelectedService(service)
    setFormData((prev) => ({ ...prev, serviceType: service.name }))
  }

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault()
    if (!isDraft && !validateForm()) return

    setLoading(true)
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weight: parseFloat(formData.weight) || 0,
          length: parseFloat(formData.length) || 0,
          width: parseFloat(formData.width) || 0,
          height: parseFloat(formData.height) || 0,
          isDraft,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create shipment')
      }

      const shipment = await response.json()
      setSuccessMessage(
        `${isDraft ? 'Draft saved' : 'Shipment finalized'} successfully! Tracking number: ${shipment.trackingNumber}`
      )

      resetForm()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => setSuccessMessage(null), 10000)
    } catch (error) {
      console.error('Error creating shipment:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create shipment',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      senderName: '',
      senderPhone: '',
      senderCountry: '',
      senderCity: '',
      senderStreet: '',
      senderPostalCode: '',
      receiverName: '',
      receiverPhone: '',
      receiverCountry: '',
      receiverCity: '',
      receiverStreet: '',
      receiverPostalCode: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      itemDescription: '',
      serviceType: '',
      signatureRequired: false,
      containsLiquid: false,
      pickupMethod: 'home',
    })
    setSenderCompleted(false)
    setReceiverCompleted(false)
    setPackageCompleted(false)
    setShipmentType(null)
    setSelectedService(null)
    setCalculatedPrice(null)
    setRateBreakdown(null)
    setReceiverRules(null)
    setPackageRules(null)
    setAdditionalOptionsRules(null)
    setServiceRules(null)
  }

  // Effects - Load initial rules
  useEffect(() => {
    loadSenderRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check sender completion
  useEffect(() => {
    if (senderRules) {
      const isComplete = checkCardComplete(senderRules, formData)
      if (isComplete && !senderCompleted) {
        setSenderCompleted(true)
      } else if (!isComplete && senderCompleted) {
        setSenderCompleted(false)
        setReceiverCompleted(false)
        setPackageCompleted(false)
        setReceiverRules(null)
        setPackageRules(null)
        setAdditionalOptionsRules(null)
        setServiceRules(null)
        setShipmentType(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, senderRules, senderCompleted])

  // Load receiver rules when sender completes
  useEffect(() => {
    if (senderCompleted) loadReceiverRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderCompleted])

  // Check receiver completion
  useEffect(() => {
    if (receiverRules && senderCompleted) {
      const isComplete = checkCardComplete(receiverRules, formData)
      const hasValidationErrors =
        receiverRules.validationErrors && Object.keys(receiverRules.validationErrors).length > 0

      if (isComplete && !hasValidationErrors && !receiverCompleted) {
        setReceiverCompleted(true)
        loadPackageRules()
      } else if ((!isComplete || hasValidationErrors) && receiverCompleted) {
        setReceiverCompleted(false)
        setPackageCompleted(false)
        setPackageRules(null)
        setAdditionalOptionsRules(null)
        setServiceRules(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, receiverRules, senderCompleted, receiverCompleted])

  // Check package completion
  useEffect(() => {
    if (packageRules && receiverCompleted) {
      const isComplete = checkCardComplete(packageRules, formData) && checkPackageComplete()
      if (isComplete && !packageCompleted) {
        setPackageCompleted(true)
        loadServiceRules()
        loadAdditionalOptionsRules()
      } else if (!isComplete && packageCompleted) {
        setPackageCompleted(false)
        setServiceRules(null)
        setAdditionalOptionsRules(null)
        setSelectedService(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, packageRules, receiverCompleted, packageCompleted])

  // Calculate price via API when service is selected or dependencies change
  useEffect(() => {
    if (selectedService) {
      loadRate()
    } else {
      setCalculatedPrice(null)
      setRateBreakdown(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedService,
    formData.weight,
    formData.senderCountry,
    formData.receiverCountry,
    formData.pickupMethod,
    formData.signatureRequired,
    formData.containsLiquid,
  ])

  // Reload sender rules when country changes
  useEffect(() => {
    if (formData.senderCountry) {
      loadSenderRules()
      if (senderCompleted) loadReceiverRules()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.senderCountry])

  // Reload receiver rules when country changes
  useEffect(() => {
    if (formData.receiverCountry) loadReceiverRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.receiverCountry])

  // Reload package rules when countries change
  useEffect(() => {
    if (formData.senderCountry && formData.receiverCountry && receiverCompleted) {
      loadPackageRules()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.senderCountry, formData.receiverCountry])

  // Reload service rules when data changes
  useEffect(() => {
    if (packageCompleted && shipmentType && formData.weight) {
      loadServiceRules()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.senderCountry, formData.receiverCountry, formData.weight, shipmentType])

  // Reload additional options when data changes
  useEffect(() => {
    if (packageCompleted) loadAdditionalOptionsRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.senderCountry, formData.receiverCountry, formData.weight])

  return {
    // State
    loading,
    errors,
    successMessage,
    formData,
    // Rules
    senderRules,
    receiverRules,
    packageRules,
    serviceRules,
    additionalOptionsRules,
    // Completion
    senderCompleted,
    receiverCompleted,
    packageCompleted,
    // Shipment
    shipmentType,
    selectedService,
    calculatedPrice,
    rateBreakdown,
    // Handlers
    handleFieldChange,
    handleFieldBlur,
    handleServiceSelect,
    handleSubmit,
  }
}
