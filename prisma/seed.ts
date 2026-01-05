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

  const hashedPassword = await bcrypt.hash('Test@1234', SALT_ROUNDS)

  // Create users for each country
  const usersData = [
    {
      email: 'jor@qacart.com',
      password: hashedPassword,
      fullName: 'أحمد الأردني',
      phone: '0791234567',
      country: 'الأردن',
      city: 'عمّان',
      street: 'شارع الملك عبدالله الثاني',
      postalCode: '11110',
    },
    {
      email: 'ksa@qacart.com',
      password: hashedPassword,
      fullName: 'خالد السعودي',
      phone: '0551234567',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      street: 'شارع الملك فهد',
      postalCode: '12211',
    },
    {
      email: 'uae@qacart.com',
      password: hashedPassword,
      fullName: 'محمد الإماراتي',
      phone: '0501234567',
      country: 'الإمارات العربية المتحدة',
      city: 'دبي',
      street: 'شارع الشيخ زايد',
      postalCode: '00000',
    },
    {
      email: 'kwt@qacart.com',
      password: hashedPassword,
      fullName: 'فهد الكويتي',
      phone: '96512345678',
      country: 'الكويت',
      city: 'مدينة الكويت',
      street: 'شارع الخليج العربي',
      postalCode: '15000',
    },
    {
      email: 'egy@qacart.com',
      password: hashedPassword,
      fullName: 'عمر المصري',
      phone: '01012345678',
      country: 'مصر',
      city: 'القاهرة',
      street: 'شارع التحرير',
      postalCode: '11511',
    },
  ]

  const users: Record<string, { id: string; email: string; fullName: string }> = {}

  for (const userData of usersData) {
    const user = await prisma.user.create({ data: userData })
    // Use country code as key (jor, ksa, uae, kwt, egy)
    const countryCode = userData.email.split('@')[0]
    users[countryCode] = { id: user.id, email: user.email, fullName: user.fullName }
    console.log(`Created user: ${user.email} (${user.fullName})`)
  }

  const jorUser = users['jor']

  // Create sample shipments with various types and statuses
  const shipments = [
    // Domestic shipment (KSA)
    {
      trackingNumber: generateTrackingNumber(),
      userId: users['ksa'].id,
      senderName: 'خالد السعودي',
      senderPhone: '0551234567',
      senderCountry: 'المملكة العربية السعودية',
      senderCity: 'الرياض',
      senderStreet: 'شارع الملك فهد',
      senderPostalCode: '12211',
      receiverName: 'سلطان العتيبي',
      receiverPhone: '0559876543',
      receiverCountry: 'المملكة العربية السعودية',
      receiverCity: 'جدة',
      receiverStreet: 'شارع الأمير سلطان',
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
    // IntraGulf shipment (Kuwait to UAE)
    {
      trackingNumber: generateTrackingNumber(),
      userId: users['kwt'].id,
      senderName: 'فهد الكويتي',
      senderPhone: '96512345678',
      senderCountry: 'الكويت',
      senderCity: 'مدينة الكويت',
      senderStreet: 'شارع الخليج العربي',
      senderPostalCode: '15000',
      receiverName: 'سعيد الإماراتي',
      receiverPhone: '0509876543',
      receiverCountry: 'الإمارات العربية المتحدة',
      receiverCity: 'دبي',
      receiverStreet: 'شارع الشيخ محمد بن راشد',
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
    // International shipment (Jordan to Egypt)
    {
      trackingNumber: generateTrackingNumber(),
      userId: users['jor'].id,
      senderName: 'أحمد الأردني',
      senderPhone: '0791234567',
      senderCountry: 'الأردن',
      senderCity: 'عمّان',
      senderStreet: 'شارع الملك عبدالله الثاني',
      senderPostalCode: '11110',
      receiverName: 'محمد القاهري',
      receiverPhone: '01012345678',
      receiverCountry: 'مصر',
      receiverCity: 'القاهرة',
      receiverStreet: 'شارع الهرم',
      receiverPostalCode: '11511',
      weight: 15.0,
      length: 50,
      width: 40,
      height: 30,
      contentDescription: 'إلكترونيات ووثائق',
      shipmentType: 'International',
      serviceType: 'international_standard',
      pickupMethod: 'home',
      signatureRequired: true,
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
    // Draft shipment (Jordan domestic)
    {
      trackingNumber: generateTrackingNumber(),
      userId: users['jor'].id,
      senderName: 'أحمد الأردني',
      senderPhone: '0791234567',
      senderCountry: 'الأردن',
      senderCity: 'عمّان',
      senderStreet: 'شارع الملك عبدالله الثاني',
      senderPostalCode: '11110',
      receiverName: 'سارة الأردنية',
      receiverPhone: '0799876543',
      receiverCountry: 'الأردن',
      receiverCity: 'إربد',
      receiverStreet: 'شارع الحصن',
      receiverPostalCode: '21110',
      weight: 3.0,
      length: 20,
      width: 15,
      height: 10,
      contentDescription: '',
      shipmentType: 'Domestic',
      serviceType: 'domestic_express',
      pickupMethod: 'home',
      signatureRequired: true,
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
    // International shipment (Egypt to KSA)
    {
      trackingNumber: generateTrackingNumber(),
      userId: users['egy'].id,
      senderName: 'عمر المصري',
      senderPhone: '01012345678',
      senderCountry: 'مصر',
      senderCity: 'الإسكندرية',
      senderStreet: 'شارع أبو قير',
      senderPostalCode: '21500',
      receiverName: 'ناصر السعودي',
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
    // UAE shipment
    {
      trackingNumber: generateTrackingNumber(),
      userId: users['uae'].id,
      senderName: 'محمد الإماراتي',
      senderPhone: '0501234567',
      senderCountry: 'الإمارات العربية المتحدة',
      senderCity: 'دبي',
      senderStreet: 'شارع الشيخ زايد',
      senderPostalCode: '00000',
      receiverName: 'علي الكويتي',
      receiverPhone: '96598765432',
      receiverCountry: 'الكويت',
      receiverCity: 'حولي',
      receiverStreet: 'شارع تونس',
      receiverPostalCode: '32001',
      weight: 8.0,
      length: 35,
      width: 25,
      height: 20,
      contentDescription: 'هدايا',
      shipmentType: 'IntraGulf',
      serviceType: 'gulf_express',
      pickupMethod: 'home',
      signatureRequired: true,
      containsLiquid: false,
      insurance: true,
      packaging: true,
      price: 95.00,
      baseCost: 60.00,
      insuranceCost: 15.00,
      signatureCost: 5.00,
      packagingCost: 8.00,
      totalCost: 95.00,
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
  console.log('Test Users (Password: Test@1234)')
  console.log('=====================================')
  for (const userData of usersData) {
    console.log(`  ${userData.email} - ${userData.fullName} (${userData.country})`)
  }
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
