# ShipTest - Shipping Management Application for Testing Education

A comprehensive Next.js application designed to teach software testing concepts including manual testing, test automation, and API testing. This application simulates a real-world shipping management system with realistic business logic, validation rules, and workflows.

## Features

- 📦 **Create Shipments**: Complete form with validation and real-time price calculation
- 📋 **Dashboard**: View all shipments with search, filter, sort, and pagination
- 🔍 **Tracking**: Detailed shipment tracking with timeline and status updates
- 🧪 **Test Mode**: Special features for testing (data-testid attributes, validation hints)
- 🔌 **RESTful API**: Full API for integration and API testing practice
- 💾 **SQLite Database**: File-based database requiring no external setup

## Technology Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **API**: Next.js API Routes

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd shipping-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   npm run setup
   ```
   This will:
   - Generate Prisma client
   - Create the SQLite database
   - Seed with 25 test shipments in various states

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

That's it! No database server, no external services, everything runs locally.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run setup` - Initialize database and seed data
- `npm run reset` - Clear database and reseed (useful for testing)

## Application Structure

```
shipping-app/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   └── shipments/        # Shipment endpoints
│   ├── shipments/            # Shipment pages
│   │   ├── new/              # Create shipment
│   │   ├── [id]/             # Shipment details
│   │   └── page.tsx          # Shipments list
│   ├── test-helper/          # Testing utilities page
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ShipmentForm.tsx      # Create shipment form
│   ├── ShipmentList.tsx      # Shipments table/list
│   ├── TrackingTimeline.tsx  # Event timeline
│   └── SearchFilter.tsx      # Search/filter controls
├── lib/                      # Utility libraries
│   ├── db.ts                 # Database client
│   ├── calculations.ts       # Business logic
│   ├── validations.ts        # Form validation
│   └── types.ts              # TypeScript types
├── prisma/                   # Database configuration
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
└── README.md                 # This file
```

## Testing Opportunities

### Manual Testing

#### 1. Form Validation Testing
Test the Create Shipment form (/shipments/new):
- **Boundary Testing**: Try weight limits for each service type
  - Standard: Max 30kg
  - Express: Max 20kg
  - Overnight: Max 10kg
- **Field Validation**: Test required fields, phone format, address length
- **Negative Testing**: Invalid inputs, special characters, empty submissions

#### 2. Business Logic Testing
- **Price Calculation**: Verify correct pricing
  - Standard: $10 base + $0.50/kg
  - Express: $20 base + $1.00/kg
  - Overnight: $35 base + $2.00/kg
- **Delivery Estimation**: Check estimated delivery dates
- **Status Transitions**: Test workflow from Pending → Delivered

#### 3. Search and Filter Testing
- Search by tracking number, sender name, receiver name
- Filter by status (All, Pending, In Transit, etc.)
- Sort by date, price, status
- Pagination functionality

#### 4. Edge Cases
- Cancel shipments in different states (should only work for Pending/Picked Up)
- Update delivered shipments (should be prevented)
- Very long names or addresses
- Special characters in input fields

### Test Automation

All interactive elements include `data-testid` attributes for easy automation:

**Example Selenium/Playwright selectors**:
```javascript
// Form fields
cy.get('[data-testid="sender-name-input"]').type('John Smith')
cy.get('[data-testid="weight-input"]').type('15')
cy.get('[data-testid="service-type-select"]').select('Express')

// Buttons
cy.get('[data-testid="submit-button"]').click()
cy.get('[data-testid="update-status-button"]').click()

// Validation
cy.get('[data-testid="weight-error"]').should('be.visible')
cy.get('[data-testid="calculated-price"]').should('contain', '$35.00')
```

### API Testing

Base URL: `http://localhost:3000/api`

#### Endpoints

**1. List Shipments**
```http
GET /api/shipments?search=TR&status=In Transit&sortBy=createdAt&page=1&limit=10
```

**2. Create Shipment**
```http
POST /api/shipments
Content-Type: application/json

{
  "senderName": "John Smith",
  "senderAddress": "123 Main St, New York, NY 10001",
  "senderPhone": "5551234567",
  "receiverName": "Jane Doe",
  "receiverAddress": "456 Oak Ave, Boston, MA 02101",
  "receiverPhone": "5559876543",
  "weight": 10,
  "length": 30,
  "width": 20,
  "height": 15,
  "serviceType": "Express"
}
```

**3. Get Shipment Details**
```http
GET /api/shipments/1
```

**4. Update Shipment Status**
```http
PUT /api/shipments/1
Content-Type: application/json

{
  "status": "In Transit"
}
```

**5. Cancel Shipment**
```http
DELETE /api/shipments/1
```

**6. Add Tracking Event**
```http
POST /api/shipments/1/events
Content-Type: application/json

{
  "status": "In Transit",
  "location": "Distribution Center, Chicago",
  "description": "Package arrived at distribution center"
}
```

**7. Get Tracking Information**
```http
GET /api/shipments/1/track
```

#### API Test Scenarios

1. **Validation Testing**: Send invalid data and verify error responses
2. **Status Codes**: Verify correct HTTP status codes (200, 201, 400, 404)
3. **Business Rules**: Test weight limits, cancellation rules
4. **Data Integrity**: Verify response data matches request
5. **Error Handling**: Test with missing fields, invalid IDs

## Test Data

The seed script creates 25 shipments with diverse characteristics:
- **3** Pending shipments
- **5** Picked Up shipments
- **6** In Transit shipments
- **4** Out for Delivery shipments
- **5** Delivered shipments
- **2** Failed deliveries (with failure reasons)

Shipments include:
- Various weights (3-15 kg) for boundary testing
- All three service types
- Different creation dates for sorting/filtering tests
- Complete tracking timelines

## Test Mode Features

When `NEXT_PUBLIC_TEST_MODE=true` (default in .env):
- All form fields show `data-testid` attributes
- Validation rules displayed on hover
- Real-time calculation breakdown shown
- Business rules highlighted in UI

## Business Rules Reference

### Service Type Constraints

| Service Type | Max Weight | Base Price | Price/kg | Delivery Time |
|-------------|-----------|------------|----------|---------------|
| Standard    | 30 kg     | $10.00     | $0.50    | 5-7 days      |
| Express     | 20 kg     | $20.00     | $1.00    | 2-3 days      |
| Overnight   | 10 kg     | $35.00     | $2.00    | 1 day         |

### Validation Rules

- **Phone**: Must be 10 digits (US format)
- **Name**: Minimum 2 characters, letters only (with spaces, hyphens, apostrophes)
- **Address**: Minimum 10 characters
- **Weight**: Must be > 0 and ≤ max for service type
- **Dimensions**: Each dimension > 0 and < 200 cm

### Status Workflow

```
Pending → Picked Up → In Transit → Out for Delivery → Delivered
                                                     ↘ Failed
```

**Cancellation Rules**:
- Can cancel: Pending, Picked Up
- Cannot cancel: In Transit, Out for Delivery, Delivered, Failed

## Common Testing Exercises

### Exercise 1: Form Validation
1. Test each validation rule individually
2. Test boundary values (e.g., exactly 30kg for Standard)
3. Document which validations are client-side vs server-side

### Exercise 2: End-to-End Workflow
1. Create a new shipment
2. Progress through each status
3. Verify tracking events are created
4. Check estimated vs actual delivery date

### Exercise 3: API Testing Suite
1. Create a Postman/Newman collection
2. Test all CRUD operations
3. Implement negative test cases
4. Validate response schemas

### Exercise 4: Automation Framework
1. Set up Selenium/Playwright/Cypress
2. Automate the create shipment flow
3. Implement Page Object Model
4. Add assertions for price calculation

## Troubleshooting

### Database Issues

**Reset the database**:
```bash
npm run reset
```

**Database file location**: `prisma/dev.db`

### Port Already in Use

Change the port in package.json or run:
```bash
PORT=3001 npm run dev
```

### Prisma Issues

Regenerate Prisma client:
```bash
npx prisma generate
```

## Learning Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **Testing Best Practices**: See comments in code for testing opportunities
- **API Testing**: Use tools like Postman, Insomnia, or REST Client

## Educational Notes

This application is designed with testing education in mind:

1. **Realistic Complexity**: Business rules are complex enough to be interesting but simple enough to understand
2. **Clear Comments**: Code includes comments explaining testing opportunities
3. **Testability**: All features include proper test IDs and accessible elements
4. **Documentation**: Business logic is well-documented for test case creation
5. **Variety**: Multiple types of testing can be practiced (UI, API, integration)

## License

This project is created for educational purposes. Feel free to use it for teaching and learning software testing.

## Contributing

This is an educational project. Feel free to fork and modify for your own testing courses or practice.

## Support

For issues or questions about using this application for testing education, please check:
1. This README for setup and usage
2. Code comments for testing hints
3. The /test-helper page for database utilities

---

**Happy Testing!** 🧪
