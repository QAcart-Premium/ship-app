import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.trackingEvent.deleteMany()
  await prisma.shipment.deleteMany()

  console.log('🌱 Database cleared')
  console.log('✅ Ready for testing!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
