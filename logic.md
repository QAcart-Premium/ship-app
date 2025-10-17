# Shipping Application - Complete Business Logic Rules

This document contains every business logic rule extracted from the shipping application codebase.

---

## Table of Contents
1. [Address & Country-Based Rules](#address--country-based-rules)
2. [Signature Requirement Rules](#signature-requirement-rules)
3. [Weight-Based Rules](#weight-based-rules)
4. [Pickup Method Rules](#pickup-method-rules)
5. [Shipment Type Detection Rules](#shipment-type-detection-rules)
6. [Dimension Validation Rules](#dimension-validation-rules)
7. [Name Validation Rules](#name-validation-rules)
8. [Phone Number Validation Rules](#phone-number-validation-rules)
9. [Postal Code Validation Rules](#postal-code-validation-rules)
10. [City Validation Rules](#city-validation-rules)
11. [Pricing Rules - Pickup/Drop-off Fees](#pricing-rules---pickupdrop-off-fees-by-country)
12. [Pricing Rules - Additional Fees](#pricing-rules---additional-fees)
13. [Service Pricing Rules](#service-pricing-rules)
14. [Price Calculation Formula](#price-calculation-formula)
15. [Service Availability Rules](#service-availability-rules)
16. [Authentication & User Rules](#authentication--user-rules)
17. [Payment Validation Rules](#payment-validation-rules)
18. [Shipment Status Rules](#shipment-status-rules)
19. [Form Validation Rules](#form-validation-rules)
20. [Progressive Form Unlocking Rules](#progressive-form-unlocking-rules)
21. [Tracking Number Rules](#tracking-number-rules)
22. [Search & Filter Rules](#search--filter-rules)
23. [Security Rules](#security-rules)

---

## Address & Country-Based Rules

* Street address is required when sender country is a Gulf country (Saudi Arabia, UAE, Kuwait, Bahrain, Qatar, Oman)
* Street address is required when receiver country is a Gulf country (Saudi Arabia, UAE, Kuwait, Bahrain, Qatar, Oman)
* Shipping from Gulf countries to Iraq is NOT allowed (blocked with validation error)
* Item description field is required when shipping from non-Gulf countries to Gulf countries (minimum 5 characters)
* Item description field is hidden when NOT shipping from non-Gulf to Gulf countries

**Gulf Countries:** Saudi Arabia, United Arab Emirates, Kuwait, Bahrain, Qatar, Oman

**Supported Countries:** Saudi Arabia, UAE, Kuwait, Bahrain, Qatar, Oman, Egypt, Jordan, Lebanon, Iraq

---

## Signature Requirement Rules

* Signature is automatically required and cannot be disabled when shipping to Jordan
* Signature is automatically required and cannot be disabled when shipping to Egypt
* Signature is optional for all other destination countries
* Signature adds $5.00 fee when required or selected

---

## Weight-Based Rules

* Weight must be greater than 0 kg
* Maximum weight for Domestic shipments (same country within Gulf): 50 kg
* Maximum weight for IntraGulf shipments (between Gulf countries): 30 kg
* Maximum weight for International shipments: 25 kg
* Weight cannot exceed service-specific maximum (varies by service type)
* Domestic Standard service supports maximum 50 kg
* Domestic Express service supports maximum 30 kg
* Gulf Standard service supports maximum 30 kg
* Gulf Express service supports maximum 20 kg
* International Economy service supports maximum 25 kg
* International Standard service supports maximum 25 kg
* Services are automatically filtered based on package weight (only compatible services are shown)

---

## Pickup Method Rules

* Home pickup is disabled when package weight exceeds 17 kg (forced to postal office drop-off)
* Iraq is an EXCEPTION: home pickup is allowed even for packages over 17 kg when sender is from Iraq
* Both home pickup and postal office drop-off are available when weight is ≤ 17 kg
* Pickup method affects pricing based on sender country

---

## Shipment Type Detection Rules

* When sender and receiver are the same country: Domestic shipment
* When both sender and receiver are Gulf countries: IntraGulf shipment
* When sender is Gulf and receiver is non-Gulf: International shipment
* When sender is non-Gulf and receiver is Gulf: IntraGulf shipment
* When both sender and receiver are non-Gulf: International shipment

---

## Dimension Validation Rules

* Length must be greater than 0 cm and cannot exceed 200 cm
* Width must be greater than 0 cm and cannot exceed 200 cm
* Height must be greater than 0 cm and cannot exceed 200 cm
* All dimensions must be positive numbers

---

## Name Validation Rules

* Sender name must be at least 2 characters
* Receiver name must be at least 2 characters
* Names can only contain letters, spaces, hyphens, and apostrophes
* Names cannot contain numbers or special characters

---

## Phone Number Validation Rules

* Phone number must have at least 10 digits
* Phone number accepts various formats: 555-0123, (555) 012-3456, 555.012.3456, +31627004821
* Phone number validation removes non-digit characters before checking length

---

## Postal Code Validation Rules

* Postal code must be between 3 and 10 characters
* Postal code is required for both sender and receiver

---

## City Validation Rules

* City name must be at least 2 characters
* City is required for both sender and receiver

---

## Pricing Rules - Pickup/Drop-off Fees by Country

### Gulf Countries
* Saudi Arabia: Home pickup $8.00, Postal office $3.00
* United Arab Emirates: Home pickup $10.00, Postal office $3.00
* Kuwait: Home pickup $7.00, Postal office $2.50
* Bahrain: Home pickup $6.00, Postal office $2.00
* Oman: Home pickup $7.00, Postal office $2.50
* Qatar: Home pickup $8.00, Postal office $3.00

### Middle East (Non-Gulf)
* Jordan: Home pickup $12.00, Postal office $4.00
* Lebanon: Home pickup $12.00, Postal office $4.00
* Egypt: Home pickup $15.00, Postal office $5.00
* Iraq: Home pickup $18.00, Postal office $6.00

### Other Countries
* Other countries (default): Home pickup $20.00, Postal office $8.00

---

## Pricing Rules - Additional Fees

* Signature required adds $5.00 fee
* Contains liquid adds $10.00 fee
* Insurance adds $15.00 fee
* Professional packaging adds $8.00 fee

---

## Service Pricing Rules

### Domestic Services
* Domestic Standard: Base $15.00 + $0.50 per kg, 3 days delivery, max 50 kg
* Domestic Express: Base $30.00 + $1.00 per kg, 1 day delivery, max 30 kg

### Gulf Services (IntraGulf)
* Gulf Standard: Base $25.00 + $1.50 per kg, 5 days delivery, max 30 kg
* Gulf Express: Base $45.00 + $2.50 per kg, 2 days delivery, max 20 kg

### International Services
* International Economy: Base $35.00 + $2.00 per kg, 10 days delivery, max 25 kg
* International Standard: Base $50.00 + $3.00 per kg, 7 days delivery, max 25 kg

---

## Price Calculation Formula

* Total price = Service base price + (Weight × Price per kg) + Pickup/drop-off fee + Signature fee + Liquid fee + Insurance fee + Packaging fee
* All prices are rounded to 2 decimal places

**Example Calculation:**
```
Sender: Kuwait
Receiver: Saudi Arabia
Weight: 5 kg
Service: Domestic Express
Pickup: Drop-off at Postal Office

Calculation:
- Service Base: $30.00
- Weight: 5 kg × $1.00 = $5.00
- Drop-off Fee (Saudi Arabia): $3.00
- Total: $38.00
```

---

## Service Availability Rules

* Services are filtered based on package weight (only show services that can handle the weight)
* Domestic shipments offer Standard and Express services
* IntraGulf shipments offer Standard and Express services
* International shipments offer Economy and Standard services
* If no services can handle the weight, show "No services available" message

---

## Authentication & User Rules

* Email must be in valid format (contains @ and domain)
* Password must be at least 6 characters
* All registration fields are required (email, password, fullName, phone, country, city, street, postalCode, card details)
* Email must be unique (cannot register with existing email)
* User must be authenticated to create shipments
* User must be authenticated to view shipments
* User must be authenticated to finalize shipments
* User must be authenticated to access payment information
* Authentication token expires after 30 days

---

## Payment Validation Rules

* Card number must be 13-19 digits
* Card number must pass Luhn algorithm validation
* Card expiry must be in MM/YY or MM/YYYY format
* Card expiry month must be between 1 and 12
* Card must not be expired (expiry date must be in the future)
* CVV must be 3 or 4 digits
* Test card for mock payment: 4111111111111111, CVV: 111, with future expiry date
* Payment information must be valid before finalizing shipment
* Payment information is encrypted before storage using AES-256-CBC encryption
* User must have valid payment information stored to finalize a shipment
* Payment validation occurs before shipment finalization

---

## Shipment Status Rules

* New shipments start with status 'draft' when saved without finalization
* Shipments get status 'finalized' when payment is confirmed
* Draft shipments can be finalized later
* Only draft shipments can be finalized (cannot finalize already finalized shipments)
* Finalized shipments get a tracking number (format: TR + 9 random digits)
* Finalized shipments get an estimated delivery date based on service type
* Initial tracking event "Order Placed" is created when shipment is finalized

---

## Form Validation Rules

* All required fields must be filled before proceeding to next section
* Sender card must be completed before receiver card is enabled
* Receiver card must be completed before package card is enabled
* Package card must be completed before service selection is enabled
* Service must be selected before rate is calculated
* Form validation happens on blur and on submission
* API validation errors take priority over client-side validation

---

## Progressive Form Unlocking Rules

* Sender Information card is always enabled on form load
* Receiver Information card unlocks only after sender card is complete
* Package Information card unlocks only after receiver card is complete
* Service Selection card unlocks only after package card is complete
* Additional Options card unlocks only after package card is complete
* Rate card shows only after service is selected

---

## Tracking Number Rules

* Tracking number format: TR followed by 9 random digits (e.g., TR123456789)
* Tracking number is 11 characters total
* Tracking number is generated automatically when shipment is finalized

---

## Search & Filter Rules

* Users can only view their own shipments
* Search works across tracking number, sender name, and receiver name (case-insensitive)
* Shipments can be filtered by status (Pending, In Transit, Delivered, Failed, or All)
* Shipments can be filtered by shipment type (Domestic, IntraGulf, International, or all)
* Shipments can be sorted by creation date, price, or status
* Sorting can be ascending or descending
* Pagination: default 10 items per page

---

## Security Rules

* JWT tokens are signed with secret key
* Authentication cookies are HTTP-only
* Cookies are secure in production environment
* Cookies use SameSite: lax policy
* Cookies expire after 30 days (2,592,000 seconds)
* Passwords are hashed using bcrypt with 10 salt rounds
* Card information is encrypted using AES-256-CBC encryption
* Card numbers are masked showing only last 4 digits when displayed
* Encryption key should be stored in environment variables (uses default in development)

---

## Business Logic Implementation Locations

### API Routes
* `/app/api/rules/sender/route.ts` - Sender card rules and Gulf country street requirement
* `/app/api/rules/receiver/route.ts` - Receiver card rules and Gulf→Iraq validation
* `/app/api/rules/package/route.ts` - Package rules, shipment type detection, item description requirement
* `/app/api/rules/service/route.ts` - Service filtering by type and weight
* `/app/api/rules/additional-options/route.ts` - Signature and pickup method rules
* `/app/api/rates/route.ts` - Complete pricing calculation with all fees

### Validation & Calculation Logic
* `/lib/validations.ts` - Field validation functions (phone, name, weight, dimensions, etc.)
* `/lib/calculations.ts` - Price calculation and delivery estimation
* `/lib/encryption.ts` - Payment card validation and encryption (Luhn algorithm, CVV validation)
* `/lib/auth.ts` - Authentication and authorization logic

### Configuration Files
* `/lib/rules/countries.json` - Country list with Gulf classification
* `/lib/rules/sender-card.json` - Base sender field definitions
* `/lib/rules/receiver-card.json` - Base receiver field definitions
* `/lib/rules/package-card.json` - Package field definitions with shipment type weight limits
* `/lib/rules/service-card.json` - Service options by shipment type with pricing
* `/lib/rules/additional-options.json` - Base additional options definitions
* `/lib/rules/pricing.json` - Pickup/drop-off fees by country and additional option fees

---

## Testing Scenarios

### Scenario 1: Gulf to Gulf (Street Required)
```
Sender: Kuwait (Gulf) → Street REQUIRED
Receiver: Saudi Arabia (Gulf) → Street REQUIRED
Expected: Both street fields must be filled
```

### Scenario 2: Blocked Shipment
```
Sender: UAE (Gulf)
Receiver: Iraq
Expected: Validation error - "Shipping from Gulf countries to Iraq is currently not possible"
```

### Scenario 3: Non-Gulf to Gulf (Item Description Required)
```
Sender: Lebanon (Non-Gulf)
Receiver: Qatar (Gulf)
Expected: Item description field appears and is required (min 5 chars)
```

### Scenario 4: Heavy Package Restriction
```
Sender: Kuwait
Weight: 18 kg
Expected: Home pickup disabled, only postal office drop-off available
```

### Scenario 5: Iraq Exception for Heavy Package
```
Sender: Iraq
Weight: 18 kg
Expected: Both home pickup and postal office available (Iraq exception)
```

### Scenario 6: Mandatory Signature
```
Receiver: Jordan OR Egypt
Expected: Signature checkbox auto-checked and disabled, $5 fee added
```

### Scenario 7: Weight Exceeds Shipment Type Limit
```
Sender: Lebanon (Non-Gulf)
Receiver: Kuwait (Gulf)
Shipment Type: IntraGulf (max 30 kg)
Weight: 35 kg
Expected: Validation error - weight exceeds maximum for IntraGulf
```

### Scenario 8: No Services Available
```
Weight: 22 kg
Shipment Type: Gulf Express (max 20 kg)
Expected: Service filtered out, "No services available" message
```

---

## Summary

**Total Business Rules Documented: 130+**

This comprehensive list covers all validation, pricing, authentication, security, and workflow rules implemented in the shipping application. Each rule is enforced through a combination of:
- Frontend validation (immediate user feedback)
- API validation (server-side enforcement)
- Database constraints (data integrity)
- Business logic in route handlers (complex rules)

All rules are designed to work together to create a robust, secure, and user-friendly shipping management system.
