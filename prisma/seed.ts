import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const SALT_ROUNDS = 10

// Generate random tracking number
function generateTrackingNumber(): string {
  const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
  return `TR${randomDigits}`
}

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.shipment.deleteMany()
  await prisma.user.deleteMany()

  // Create test user with generic Arabic name
  const hashedPassword = await bcrypt.hash('Test@1234', SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      fullName: 'أحمد المصري',
      phone: '0791234567',
      country: 'الأردن',
      city: 'عمّان',
      street: 'شارع الرينبو',
      postalCode: '11110',
    },
  })

  console.log('Created test user:', {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
  })

  // Create sample shipments with various types and statuses
  const shipments = [
    // Domestic shipments (same country)
    {
      trackingNumber: generateTrackingNumber(),
      userId: user.id,
      senderName: 'أحمد المصري',
      senderPhone: '0791234567',
      senderCountry: 'المملكة العربية السعودية',
      senderCity: 'الرياض',
      senderStreet: 'طريق الملك فهد',
      senderPostalCode: '12211',
      receiverName: 'خالد العتيبي',
      receiverPhone: '0551234567',
      receiverCountry: 'المملكة العربية السعودية',
      receiverCity: 'جدة',
      receiverStreet: 'شارع فلسطين',
      receiverPostalCode: '21442',
      weight: 5.0,
      length: 30,
      width: 20,
      height: 15,
      contentDescription: '',
      shipmentType: 'Domestic',
      serviceType: 'domestic_standard',
      pickupMethod: 'home',
      signatureRequired: false,
      containsLiquid: false,
      insurance: false,
      packaging: false,
      price: 20.50,
      baseCost: 17.50,
      insuranceCost: 0,
      signatureCost: 0,
      packagingCost: 0,
      totalCost: 20.50,
      isDraft: false,
      status: 'finalized',
    },
    // IntraGulf shipment
    {
      trackingNumber: generateTrackingNumber(),
      userId: user.id,
      senderName: 'أحمد المصري',
      senderPhone: '0791234567',
      senderCountry: 'الكويت',
      senderCity: 'مدينة الكويت',
      senderStreet: 'طريق الخليج',
      senderPostalCode: '15000',
      receiverName: 'فاطمة الكويتية',
      receiverPhone: '97165123456',
      receiverCountry: 'الإمارات العربية المتحدة',
      receiverCity: 'دبي',
      receiverStreet: 'شارع الشيخ زايد',
      receiverPostalCode: '00000',
      weight: 10.0,
      length: 40,
      width: 30,
      height: 25,
      contentDescription: '',
      shipmentType: 'IntraGulf',
      serviceType: 'gulf_standard',
      pickupMethod: 'postal_office',
      signatureRequired: true,
      containsLiquid: false,
      insurance: true,
      packaging: false,
      price: 65.00,
      baseCost: 40.00,
      insuranceCost: 15.00,
      signatureCost: 5.00,
      packagingCost: 0,
      totalCost: 65.00,
      isDraft: false,
      status: 'finalized',
    },
    // International shipment
    {
      trackingNumber: generateTrackingNumber(),
      userId: user.id,
      senderName: 'أحمد المصري',
      senderPhone: '0791234567',
      senderCountry: 'الأردن',
      senderCity: 'عمّان',
      senderStreet: 'شارع الرينبو',
      senderPostalCode: '11110',
      receiverName: 'محمد القاهري',
      receiverPhone: '01012345678',
      receiverCountry: 'مصر',
      receiverCity: 'القاهرة',
      receiverStreet: 'ميدان التحرير',
      receiverPostalCode: '11511',
      weight: 15.0,
      length: 50,
      width: 40,
      height: 30,
      contentDescription: 'إلكترونيات ووثائق',
      shipmentType: 'International',
      serviceType: 'international_standard',
      pickupMethod: 'home',
      signatureRequired: true, // Required for Egypt
      containsLiquid: false,
      insurance: true,
      packaging: true,
      price: 123.00,
      baseCost: 95.00,
      insuranceCost: 15.00,
      signatureCost: 5.00,
      packagingCost: 8.00,
      totalCost: 123.00,
      isDraft: false,
      status: 'finalized',
    },
    // Draft shipment (incomplete)
    {
      trackingNumber: generateTrackingNumber(),
      userId: user.id,
      senderName: 'أحمد المصري',
      senderPhone: '0791234567',
      senderCountry: 'الأردن',
      senderCity: 'عمّان',
      senderStreet: 'شارع الرينبو',
      senderPostalCode: '11110',
      receiverName: 'سارة الأردنية',
      receiverPhone: '0799876543',
      receiverCountry: 'الأردن',
      receiverCity: 'إربد',
      receiverStreet: 'شارع الجامعة',
      receiverPostalCode: '21110',
      weight: 3.0,
      length: 20,
      width: 15,
      height: 10,
      contentDescription: '',
      shipmentType: 'Domestic',
      serviceType: 'domestic_express',
      pickupMethod: 'home',
      signatureRequired: true, // Required for Jordan
      containsLiquid: false,
      insurance: false,
      packaging: false,
      price: 45.00,
      baseCost: 33.00,
      insuranceCost: 0,
      signatureCost: 5.00,
      packagingCost: 0,
      totalCost: 45.00,
      isDraft: true,
      status: 'draft',
    },
    // Another international - economy
    {
      trackingNumber: generateTrackingNumber(),
      userId: user.id,
      senderName: 'أحمد المصري',
      senderPhone: '0791234567',
      senderCountry: 'مصر',
      senderCity: 'الإسكندرية',
      senderStreet: 'طريق الكورنيش',
      senderPostalCode: '21500',
      receiverName: 'عمر السعودي',
      receiverPhone: '0561234567',
      receiverCountry: 'المملكة العربية السعودية',
      receiverCity: 'الدمام',
      receiverStreet: 'شارع الملك سعود',
      receiverPostalCode: '32241',
      weight: 20.0,
      length: 60,
      width: 40,
      height: 35,
      contentDescription: 'ملابس وأغراض شخصية',
      shipmentType: 'International',
      serviceType: 'international_economy',
      pickupMethod: 'postal_office',
      signatureRequired: false,
      containsLiquid: false,
      insurance: false,
      packaging: true,
      price: 88.00,
      baseCost: 75.00,
      insuranceCost: 0,
      signatureCost: 0,
      packagingCost: 8.00,
      totalCost: 88.00,
      isDraft: false,
      status: 'finalized',
    },
  ]

  for (const shipment of shipments) {
    await prisma.shipment.create({ data: shipment })
  }

  console.log(`Created ${shipments.length} sample shipments`)

  console.log('')
  console.log('=====================================')
  console.log('Test Credentials:')
  console.log('Email: user@example.com')
  console.log('Password: Test@1234')
  console.log('=====================================')
  console.log('')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
