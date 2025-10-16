# Shipping Application - Business Logic Documentation

## Table of Contents
1. [Overview](#overview)
2. [Progressive Form Unlocking](#progressive-form-unlocking)
3. [Shipment Type Detection](#shipment-type-detection)
4. [Sender Card Rules](#sender-card-rules)
5. [Receiver Card Rules](#receiver-card-rules)
6. [Package Card Rules](#package-card-rules)
7. [Service Selection Rules](#service-selection-rules)
8. [Additional Options Rules](#additional-options-rules)
9. [Rate Calculation](#rate-calculation)
10. [Field Validation Rules](#field-validation-rules)

---

## Overview

This application uses an **API-driven rules engine** where all business logic is centralized in the backend. The frontend makes POST requests to retrieve dynamic rules based on the current form state, ensuring all validation and business rules are consistent and maintainable.

### Architecture Principles
- **Backend-Driven**: All rules come from API endpoints (no hardcoded logic in frontend)
- **Progressive Disclosure**: Cards unlock sequentially based on completion
- **Reactive Updates**: Rules reload automatically when dependencies change
- **Dynamic Validation**: Field requirements and visibility change based on context

---

## Progressive Form Unlocking

The form uses a sequential unlocking mechanism where each card must be completed before the next card becomes available.

| Card | Unlocks When | API Endpoint |
|------|-------------|--------------|
| **Sender Information** | Always enabled on load | `/api/rules/sender` |
| **Receiver Information** | Sender card is complete | `/api/rules/receiver` |
| **Package Information** | Receiver card is complete | `/api/rules/package` |
| **Service Selection** | Package card is complete | `/api/rules/service` |
| **Additional Options** | Package card is complete | `/api/rules/additional-options` |
| **Rate** | Service is selected | Calculated client-side |

### Card Completion Criteria

| Card | Required Fields | Additional Criteria |
|------|----------------|-------------------|
| Sender | name, phone, country, city, street, postalCode | All fields must pass validation |
| Receiver | name, phone, country, city, street, postalCode | No API validation errors (e.g., Gulf→Iraq blocked) |
| Package | weight, length, width, height, itemDescription* | All numbers > 0, itemDescription only if non-Gulf→Gulf |
| Service | N/A | User must select one service option |

*itemDescription is conditionally required based on sender/receiver countries

---

## Shipment Type Detection

The application automatically detects the shipment type based on sender and receiver countries.

### Country Classification

**Gulf Countries (GCC):**
- Saudi Arabia
- United Arab Emirates
- Kuwait
- Bahrain
- Oman
- Qatar

### Shipment Type Rules

| Sender Country | Receiver Country | Shipment Type | Max Weight |
|---------------|------------------|---------------|------------|
| Gulf | Gulf | **Domestic** | 30 kg |
| Gulf | Non-Gulf | **International** | 25 kg |
| Non-Gulf | Gulf | **IntraGulf** | 20 kg |
| Non-Gulf | Non-Gulf | **International** | 25 kg |

### Implementation
```javascript
// Location: /app/api/rules/package/route.ts
function determineShipmentType(senderCountry, receiverCountry) {
  const isSenderGulf = isGulfCountry(senderCountry)
  const isReceiverGulf = isGulfCountry(receiverCountry)

  if (isSenderGulf && isReceiverGulf) return 'Domestic'
  if (!isSenderGulf && isReceiverGulf) return 'IntraGulf'
  return 'International'
}
```

---

## Sender Card Rules

The sender card is always enabled and provides the foundation for all subsequent rules.

### API Endpoint
`POST /api/rules/sender`

### Request Body
```json
{
  "formData": {
    "senderCountry": "Kuwait",
    "senderCity": "Kuwait City",
    ...
  }
}
```

### Business Rules
1. **All fields are required** (name, phone, country, city, street, postalCode)
2. **Phone validation**: Must match pattern for selected country
3. **Postal code validation**: Required for all countries
4. **Dynamic country list**: Retrieved from `/lib/rules/countries.json`

### Validation Rules

| Field | Type | Validation |
|-------|------|-----------|
| senderName | text | Required, 2-100 characters |
| senderPhone | text | Required, country-specific pattern |
| senderCountry | select | Required, must be from country list |
| senderCity | text | Required, 2-50 characters |
| senderStreet | text | Required, 5-200 characters |
| senderPostalCode | text | Required, 3-20 characters |

---

## Receiver Card Rules

The receiver card unlocks after sender completion and includes cross-country validation.

### API Endpoint
`POST /api/rules/receiver`

### Request Body
```json
{
  "formData": {
    "senderCountry": "Kuwait",
    "receiverCountry": "Iraq",
    ...
  }
}
```

### Business Rules

#### Rule 1: Gulf → Iraq Restriction
**Condition**: If sender is from Gulf country AND receiver is Iraq
**Action**: Block shipment with validation error
**Error Message**: "Shipping from Gulf countries to Iraq is currently not possible"

```javascript
// Location: /app/api/rules/receiver/route.ts
if (isGulfCountry(senderCountry) && receiverCountry === 'Iraq') {
  rules.validationErrors = {
    receiverCountry: 'Shipping from Gulf countries to Iraq is currently not possible'
  }
}
```

### Validation Rules

| Field | Type | Validation |
|-------|------|-----------|
| receiverName | text | Required, 2-100 characters |
| receiverPhone | text | Required, country-specific pattern |
| receiverCountry | select | Required, API validates against sender |
| receiverCity | text | Required, 2-50 characters |
| receiverStreet | text | Required, 5-200 characters |
| receiverPostalCode | text | Required, 3-20 characters |

---

## Package Card Rules

The package card unlocks after receiver completion and provides dynamic weight limits and field visibility.

### API Endpoint
`POST /api/rules/package`

### Request Body
```json
{
  "formData": {
    "senderCountry": "Kuwait",
    "receiverCountry": "Lebanon",
    "weight": "5",
    ...
  }
}
```

### Business Rules

#### Rule 1: Dynamic Weight Limits
Weight limits depend on the detected shipment type:

| Shipment Type | Max Weight | Max Dimension (each) |
|---------------|-----------|---------------------|
| Domestic | 30 kg | 200 cm |
| IntraGulf | 20 kg | 200 cm |
| International | 25 kg | 200 cm |

#### Rule 2: Item Description Visibility & Requirement
**Condition**: Sender is NOT from Gulf AND Receiver IS from Gulf
**Action**: Show and require itemDescription field
**Otherwise**: Hide itemDescription field

```javascript
// Location: /app/api/rules/package/route.ts
const isSenderGulf = isGulfCountry(senderCountry)
const isReceiverGulf = isGulfCountry(receiverCountry)
const isNonGulfToGulf = !isSenderGulf && isReceiverGulf

if (rules.fields.itemDescription) {
  rules.fields.itemDescription.required = isNonGulfToGulf
  rules.fields.itemDescription.visible = isNonGulfToGulf
}
```

### Validation Rules

| Field | Type | Validation | Notes |
|-------|------|-----------|-------|
| weight | number | Required, 0.1 - maxWeight kg | maxWeight depends on shipment type |
| length | number | Required, 1 - 200 cm | Fixed max dimension |
| width | number | Required, 1 - 200 cm | Fixed max dimension |
| height | number | Required, 1 - 200 cm | Fixed max dimension |
| itemDescription | text | Conditional, 5-200 characters | Only visible/required for non-Gulf→Gulf |

### Reactive Updates
The package rules API is called whenever:
- Sender country changes
- Receiver country changes

This ensures weight limits and itemDescription visibility are always correct.

---

## Service Selection Rules

Service options are filtered based on shipment type and package weight.

### API Endpoint
`POST /api/rules/service`

### Request Body
```json
{
  "shipmentType": "International",
  "formData": {
    "weight": "5"
  }
}
```

### Business Rules

#### Rule 1: Service Availability by Shipment Type
Each shipment type has different available services:

| Service | Type | Max Weight | Base Price | Price/kg | Delivery Days |
|---------|------|-----------|------------|----------|---------------|
| **Express** | Domestic | 30 kg | $15 | $2.50 | 1 |
| **Standard** | Domestic | 30 kg | $10 | $1.50 | 2-3 |
| **Economy** | Domestic | 30 kg | $5 | $1.00 | 4-5 |
| **Express** | IntraGulf | 20 kg | $25 | $4.00 | 2-3 |
| **Standard** | IntraGulf | 20 kg | $18 | $3.00 | 4-5 |
| **Express** | International | 25 kg | $40 | $6.00 | 3-5 |
| **Standard** | International | 25 kg | $30 | $4.50 | 7-10 |
| **Economy** | International | 25 kg | $20 | $3.00 | 14-21 |

#### Rule 2: Weight-Based Filtering
Services are automatically filtered by weight capacity:

```javascript
// Location: /app/api/rules/service/route.ts
if (weight) {
  const weightNum = parseFloat(weight)
  if (!isNaN(weightNum)) {
    availableServices = services.filter(
      (service) => weightNum <= service.maxWeight
    )
  }
}
```

**Example**: If package weighs 22 kg and shipment type is IntraGulf:
- ❌ All IntraGulf services (max 20 kg) are filtered out
- ✅ User sees "No services available" message

### Reactive Updates
The service rules API is called whenever:
- Sender country changes
- Receiver country changes
- Weight changes
- Shipment type changes

---

## Additional Options Rules

Additional options provide context-specific requirements for signature and pickup method.

### API Endpoint
`POST /api/rules/additional-options`

### Request Body
```json
{
  "formData": {
    "senderCountry": "Kuwait",
    "receiverCountry": "Jordan",
    "weight": "18"
  }
}
```

### Business Rules

#### Rule 1: Mandatory Signature for Jordan & Egypt
**Condition**: Receiver country is Jordan OR Egypt
**Action**:
- Automatically check "Signature Required"
- Disable the checkbox (user cannot uncheck)
- Auto-apply to formData

```javascript
// Location: /app/api/rules/additional-options/route.ts
const isReceiverJordanOrEgypt =
  receiverCountry === 'Jordan' || receiverCountry === 'Egypt'

if (rules.fields.signatureRequired) {
  rules.fields.signatureRequired.checked = isReceiverJordanOrEgypt
  rules.fields.signatureRequired.disabled = isReceiverJordanOrEgypt
}
```

| Receiver Country | Signature Required | Can Change? |
|-----------------|-------------------|-------------|
| Jordan | ✅ Yes (Auto-checked) | ❌ No |
| Egypt | ✅ Yes (Auto-checked) | ❌ No |
| All Others | ❌ No (Unchecked) | ✅ Yes |

#### Rule 2: Pickup Method Restrictions by Weight
**Condition**: Package weight > 17 kg AND sender NOT from Iraq
**Action**:
- Only allow "Drop off at Postal Office"
- Disable "Pickup from Home" option
- Auto-change to postal_office if home was selected

```javascript
// Location: /app/api/rules/additional-options/route.ts
const isSenderIraq = senderCountry === 'Iraq'
const isHeavyPackage = weight > 17

if (rules.fields.pickupMethod) {
  if (isHeavyPackage && !isSenderIraq) {
    rules.fields.pickupMethod.allowedValues = ['postal_office']
    rules.fields.pickupMethod.defaultValue = 'postal_office'
    rules.fields.pickupMethod.disabledValues = ['home']
  } else {
    rules.fields.pickupMethod.allowedValues = ['home', 'postal_office']
    rules.fields.pickupMethod.defaultValue = 'home'
    rules.fields.pickupMethod.disabledValues = []
  }
}
```

### Pickup Method Decision Table

| Weight | Sender Country | Home Pickup | Postal Drop-off |
|--------|---------------|-------------|-----------------|
| ≤ 17 kg | Any | ✅ Available | ✅ Available |
| > 17 kg | Iraq | ✅ Available | ✅ Available |
| > 17 kg | Non-Iraq (including Gulf) | ❌ Disabled | ✅ Only Option |

**Example Scenarios:**

| Sender | Receiver | Weight | Home Pickup | Postal Drop-off | Signature |
|--------|----------|--------|-------------|-----------------|-----------|
| Kuwait | Lebanon | 15 kg | ✅ Available | ✅ Available | ❌ Optional |
| Kuwait | Jordan | 15 kg | ✅ Available | ✅ Available | ✅ Required |
| UAE | Egypt | 18 kg | ❌ Disabled | ✅ Only Option | ✅ Required |
| Iraq | Jordan | 18 kg | ✅ Available | ✅ Available | ✅ Required |
| Lebanon | Kuwait | 20 kg | ❌ Disabled | ✅ Only Option | ❌ Optional |

### Reactive Updates
The additional options rules API is called whenever:
- Sender country changes (affects pickup method)
- Receiver country changes (affects signature requirement)
- Weight changes (affects pickup method)

### Auto-Apply Logic
When rules are loaded, the hook automatically applies certain rules to formData:

```javascript
// Location: /hooks/useShipmentForm.ts
// Auto-check signature if required
if (rules.fields?.signatureRequired?.checked) {
  setFormData((prev) => ({ ...prev, signatureRequired: true }))
}

// Auto-change pickup method if current selection is disabled
if (rules.fields?.pickupMethod?.disabledValues?.includes(formData.pickupMethod)) {
  setFormData((prev) => ({
    ...prev,
    pickupMethod: rules.fields.pickupMethod.defaultValue,
  }))
}
```

---

## Rate Calculation

The rate is calculated by the backend API based on multiple factors including service, weight, country, pickup method, and additional options.

### API Endpoint
`POST /api/rates`

### Request Body
```json
{
  "serviceId": "domestic-express",
  "weight": 15,
  "senderCountry": "Kuwait",
  "receiverCountry": "Saudi Arabia",
  "pickupMethod": "home",
  "signatureRequired": false,
  "containsLiquid": false
}
```

### Pricing Formula
```
Total Price = Service Base Price
            + (Weight × Service Price per kg)
            + Pickup/Drop-off Fee (varies by country)
            + Signature Fee (if selected)
            + Liquid Handling Fee (if selected)
```

---

### Base Service Prices

Refer to [Service Selection Rules](#service-selection-rules) for base service prices and price per kg.

---

### Pickup & Drop-off Fees by Country

Different countries have different fees for pickup service vs drop-off at postal office.

#### Gulf Countries (GCC)

| Country | Pickup from Home | Drop-off at Postal Office |
|---------|-----------------|---------------------------|
| Saudi Arabia | $8.00 | $3.00 |
| United Arab Emirates | $10.00 | $3.00 |
| Kuwait | $7.00 | $2.50 |
| Bahrain | $6.00 | $2.00 |
| Oman | $7.00 | $2.50 |
| Qatar | $8.00 | $3.00 |

#### Middle East (Non-Gulf)

| Country | Pickup from Home | Drop-off at Postal Office |
|---------|-----------------|---------------------------|
| Jordan | $12.00 | $4.00 |
| Lebanon | $12.00 | $4.00 |
| Egypt | $15.00 | $5.00 |
| Iraq | $18.00 | $6.00 |

#### Other Countries

| Region | Pickup from Home | Drop-off at Postal Office |
|--------|-----------------|---------------------------|
| All Other Countries | $20.00 | $8.00 |

---

### Additional Option Fees

| Option | Fee | When Applied |
|--------|-----|-------------|
| **Signature Required** | $5.00 | When user selects signature OR destination is Jordan/Egypt (mandatory) |
| **Contains Liquid** | $10.00 | When user selects liquid handling |

**Note**: Signature fee is always charged for Jordan/Egypt destinations since signature is mandatory for these countries.

---

### Complete Pricing Examples

#### Example 1: Simple Domestic Shipment
```
Sender: Kuwait
Receiver: Saudi Arabia
Weight: 5 kg
Service: Express (Domestic)
Pickup Method: Drop-off at Postal Office
Signature: No
Liquid: No

Calculation:
- Service Base Price: $15.00
- Weight Charge: 5 kg × $2.50 = $12.50
- Drop-off Fee (Saudi Arabia): $3.00
- Signature Fee: $0.00
- Liquid Fee: $0.00
────────────────────────────
Total: $30.50
```

#### Example 2: International with All Options
```
Sender: Kuwait
Receiver: USA
Weight: 10 kg
Service: Express (International)
Pickup Method: Pickup from Home
Signature: Yes
Liquid: Yes

Calculation:
- Service Base Price: $40.00
- Weight Charge: 10 kg × $6.00 = $60.00
- Pickup Fee (Kuwait): $7.00
- Signature Fee: $5.00
- Liquid Fee: $10.00
────────────────────────────
Total: $122.00
```

#### Example 3: Jordan Destination (Mandatory Signature)
```
Sender: Lebanon
Receiver: Jordan
Weight: 8 kg
Service: Standard (International)
Pickup Method: Drop-off at Postal Office
Signature: Yes (Mandatory)
Liquid: No

Calculation:
- Service Base Price: $30.00
- Weight Charge: 8 kg × $4.50 = $36.00
- Drop-off Fee (Lebanon): $4.00
- Signature Fee: $5.00 (mandatory for Jordan)
- Liquid Fee: $0.00
────────────────────────────
Total: $75.00
```

#### Example 4: Heavy Package from Iraq
```
Sender: Iraq
Receiver: Kuwait
Weight: 18 kg
Service: Standard (IntraGulf)
Pickup Method: Pickup from Home (Available - Iraq exception)
Signature: No
Liquid: Yes

Calculation:
- Service Base Price: $18.00
- Weight Charge: 18 kg × $3.00 = $54.00
- Pickup Fee (Iraq): $18.00
- Signature Fee: $0.00
- Liquid Fee: $10.00
────────────────────────────
Total: $100.00
```

---

### Comprehensive Pricing Scenarios

| Scenario | Sender | Receiver | Weight | Service | Pickup | Signature | Liquid | Base | Weight | Pickup/Drop | Signature | Liquid | **Total** |
|----------|--------|----------|--------|---------|--------|-----------|--------|------|--------|-------------|-----------|--------|-----------|
| 1 | Kuwait | Saudi Arabia | 5 kg | Domestic Express | Drop-off | No | No | $15 | $12.50 | $3.00 | $0 | $0 | **$30.50** |
| 2 | Kuwait | Saudi Arabia | 5 kg | Domestic Express | Pickup | No | No | $15 | $12.50 | $7.00 | $0 | $0 | **$34.50** |
| 3 | UAE | Jordan | 12 kg | International Express | Drop-off | Yes* | No | $40 | $72.00 | $3.00 | $5 | $0 | **$120.00** |
| 4 | UAE | Jordan | 12 kg | International Express | Drop-off | Yes* | Yes | $40 | $72.00 | $3.00 | $5 | $10 | **$130.00** |
| 5 | Lebanon | Qatar | 10 kg | IntraGulf Express | Drop-off | No | No | $25 | $40.00 | $4.00 | $0 | $0 | **$69.00** |
| 6 | Iraq | Kuwait | 18 kg | IntraGulf Standard | Pickup | No | No | $18 | $54.00 | $18.00 | $0 | $0 | **$90.00** |
| 7 | USA | Egypt | 15 kg | International Standard | Pickup | Yes* | Yes | $30 | $67.50 | $20.00 | $5 | $10 | **$132.50** |
| 8 | Kuwait | Lebanon | 3 kg | International Economy | Drop-off | Yes | No | $20 | $9.00 | $2.50 | $5 | $0 | **$36.50** |

*Signature is mandatory for Jordan and Egypt destinations.

---

### Rate Calculation Triggers

The rate API is called whenever ANY of the following changes **AFTER** a service has been selected:

| Trigger | Why Rate Needs Recalculation |
|---------|----------------------------|
| Weight changes | Affects weight-based charges |
| Sender country changes | Affects pickup/drop-off fees |
| Receiver country changes | Affects mandatory signature, affects fee structure |
| Pickup method changes | Different fees for pickup vs drop-off |
| Signature option changes | $5 fee added/removed |
| Liquid option changes | $10 fee added/removed |
| Service selection changes | Different base price and price per kg |

**Important**: Rate is NOT calculated until a service is selected.

---

### Implementation

```javascript
// Location: /hooks/useShipmentForm.ts

// Call rates API when service is selected or dependencies change
useEffect(() => {
  if (selectedService) {
    loadRate()
  } else {
    setCalculatedPrice(null)
    setRateBreakdown(null)
  }
}, [
  selectedService,
  formData.weight,
  formData.senderCountry,
  formData.receiverCountry,
  formData.pickupMethod,
  formData.signatureRequired,
  formData.containsLiquid,
])

const loadRate = async () => {
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
    const data = await response.json()
    setCalculatedPrice(data.totalPrice)
    setRateBreakdown(data.breakdown)
  } catch (error) {
    console.error('Error calculating rate:', error)
  }
}
```

---

### API Response Format

```json
{
  "totalPrice": 122.00,
  "breakdown": {
    "serviceBase": 40.00,
    "weightCharge": 60.00,
    "pickupFee": 7.00,
    "signatureFee": 5.00,
    "liquidFee": 10.00
  },
  "context": {
    "serviceName": "Express",
    "shipmentType": "International",
    "weight": 10,
    "senderCountry": "Kuwait",
    "receiverCountry": "USA",
    "pickupMethod": "home"
  }
}
```

---

## Field Validation Rules

All fields have validation rules enforced on blur and on form submission.

### Text Field Validation

| Field | Min Length | Max Length | Pattern | Required |
|-------|-----------|-----------|---------|----------|
| Name (sender/receiver) | 2 | 100 | - | ✅ |
| Phone | - | - | Country-specific | ✅ |
| City | 2 | 50 | - | ✅ |
| Street | 5 | 200 | - | ✅ |
| Postal Code | 3 | 20 | - | ✅ |
| Item Description | 5 | 200 | - | Conditional |

### Number Field Validation

| Field | Min | Max | Step | Required |
|-------|-----|-----|------|----------|
| Weight | 0.1 | Varies by type | 0.1 | ✅ |
| Length | 1 | 200 | 0.1 | ✅ |
| Width | 1 | 200 | 0.1 | ✅ |
| Height | 1 | 200 | 0.1 | ✅ |

### Validation Timing

| Event | Action |
|-------|--------|
| **On Blur** | Validate individual field, show error if invalid |
| **On Change** | Clear error for that field |
| **On Submit** | Validate entire form, block submission if errors exist |
| **API Response** | Apply server-side validation errors (e.g., Gulf→Iraq) |

### Error Message Priority
1. **API Validation Errors** (highest priority, cannot be cleared by client)
2. **Required Field Errors** (shown on blur/submit)
3. **Format Errors** (pattern, min/max length, min/max value)

---

## API Rules Loading Strategy

### Initial Load
```
1. User opens form
2. Load sender rules (API call)
3. Show receiver/package/service/additional options as disabled empty cards
```

### Progressive Loading
```
1. User completes sender card
   → Load receiver rules (API call)

2. User completes receiver card
   → Load package rules (API call)

3. User completes package card
   → Load service rules (API call)
   → Load additional options rules (API call)

4. User selects service
   → Calculate price (client-side)
```

### Reactive Reloading

Certain rule APIs are called again when dependencies change:

| Dependency Changed | APIs Reloaded |
|-------------------|---------------|
| Sender country | Sender, Receiver |
| Receiver country | Receiver, Package, Additional Options |
| Weight | Package, Service, Additional Options |

### Optimization: Single Rule Source
✅ **All rules from API** - No client-side JSON imports
✅ **POST requests** - Send current formData for context-aware rules
✅ **Null state handling** - Cards show disabled message when rules not loaded

---

## Summary of Business Rules

### Country-Based Rules
1. **Gulf → Iraq**: Blocked with validation error
2. **Non-Gulf → Gulf**: Requires item description
3. **→ Jordan/Egypt**: Requires signature (auto-checked, disabled)

### Weight-Based Rules
1. **Weight limits**: Vary by shipment type (Domestic: 30kg, IntraGulf: 20kg, International: 25kg)
2. **Service filtering**: Only show services that can handle the weight
3. **Pickup restrictions**: Weight > 17kg forces postal drop-off (unless from Iraq)

### Shipment Type Rules
1. **Domestic** (Gulf → Gulf): 30kg max, 3 service options
2. **IntraGulf** (Non-Gulf → Gulf): 20kg max, 2 service options
3. **International** (all others): 25kg max, 3 service options

### Progressive Rules
1. Cards unlock sequentially
2. Changing earlier data resets later cards
3. Rules reload reactively when dependencies change
4. API provides all validation and business logic

---

## File Locations

### API Routes
- `/app/api/rules/sender/route.ts` - Sender card rules
- `/app/api/rules/receiver/route.ts` - Receiver card rules with Gulf→Iraq validation
- `/app/api/rules/package/route.ts` - Package rules with shipment type detection
- `/app/api/rules/service/route.ts` - Service filtering by type and weight
- `/app/api/rules/additional-options/route.ts` - Signature and pickup rules
- `/app/api/rates/route.ts` - Rate calculation with all fees

### Frontend Logic
- `/hooks/useShipmentForm.ts` - Main form logic hook (528 lines)
- `/components/ShipmentForm.tsx` - Presentation layer (137 lines)
- `/components/cards/*` - Individual card components

### Configuration Files
- `/lib/rules/countries.json` - Country list with Gulf classification
- `/lib/rules/sender-card.json` - Base sender field definitions
- `/lib/rules/receiver-card.json` - Base receiver field definitions
- `/lib/rules/package-card-base.json` - Base package field definitions
- `/lib/rules/service-card.json` - Service options by shipment type
- `/lib/rules/additional-options.json` - Base additional options definitions
- `/lib/rules/pricing.json` - Pickup/drop-off fees by country and additional option fees

### Types
- `/lib/rules/types.ts` - TypeScript interfaces for rules engine

---

## Testing Scenarios

### Scenario 1: Domestic Shipment (Gulf → Gulf)
```
Sender: Kuwait
Receiver: Saudi Arabia
Weight: 15 kg
Expected:
- Shipment Type: Domestic
- Max Weight: 30 kg
- Item Description: Hidden
- Services: Express (1 day), Standard (2-3 days), Economy (4-5 days)
- Pickup: Both options available
- Signature: Optional
```

### Scenario 2: Blocked Shipment (Gulf → Iraq)
```
Sender: UAE
Receiver: Iraq
Expected:
- Error on receiver country: "Shipping from Gulf countries to Iraq is currently not possible"
- Cannot proceed to package card
```

### Scenario 3: IntraGulf with Heavy Package
```
Sender: Lebanon
Receiver: Qatar
Weight: 18 kg
Expected:
- Shipment Type: IntraGulf
- Max Weight: 20 kg (within limit)
- Item Description: Required (non-Gulf → Gulf)
- Services: Express (2-3 days), Standard (4-5 days)
- Pickup: Only postal office (weight > 17kg, sender not Iraq)
- Signature: Optional
```

### Scenario 4: International to Jordan
```
Sender: USA
Receiver: Jordan
Weight: 10 kg
Expected:
- Shipment Type: International
- Max Weight: 25 kg
- Item Description: Hidden (neither is Gulf)
- Services: Express (3-5 days), Standard (7-10 days), Economy (14-21 days)
- Pickup: Both options available (weight ≤ 17kg)
- Signature: Required and disabled (Jordan destination)
```

### Scenario 5: Iraq Exception
```
Sender: Iraq
Receiver: Kuwait
Weight: 22 kg
Expected:
- Shipment Type: IntraGulf
- Max Weight: 20 kg
- Validation Error: Weight exceeds maximum for IntraGulf (20kg)
- If weight reduced to 18kg:
  - Pickup: Both options available (Iraq exception applies)
  - Signature: Optional
```

---

## Conclusion

This application demonstrates a robust API-driven rules engine where:
- ✅ All business logic is centralized in the backend
- ✅ Frontend is a thin presentation layer
- ✅ Rules are dynamic and context-aware
- ✅ Validation is consistent across client and server
- ✅ Progressive disclosure guides users through complex workflows
- ✅ Reactive updates ensure rules are always current

The architecture allows for easy maintenance and updates to business rules without frontend changes.
