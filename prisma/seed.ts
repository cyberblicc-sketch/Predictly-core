import { PrismaClient } from '@prisma/client'
import { createHmac, randomBytes } from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHmac('sha256', salt).update(password).digest('hex')
  return `${salt}:${hash}`
}

async function main() {
  console.log('Seeding database...')

  // 1. Create categories
  const categories = [
    { name: 'Politics', slug: 'politics', displayOrder: 1, icon: '🗳️' },
    { name: 'Crypto', slug: 'crypto', displayOrder: 2, icon: '₿' },
    { name: 'Sports', slug: 'sports', displayOrder: 3, icon: '🏆' },
    { name: 'Tech', slug: 'tech', displayOrder: 4, icon: '🤖' },
    { name: 'Economics', slug: 'economics', displayOrder: 5, icon: '📈' },
    { name: 'Pop Culture', slug: 'pop-culture', displayOrder: 6, icon: '🎬' },
    { name: 'Science', slug: 'science', displayOrder: 7, icon: '🔬' },
    { name: 'World', slug: 'world', displayOrder: 8, icon: '🌍' },
    { name: 'Stocks', slug: 'stocks', displayOrder: 9, icon: '📊' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories seeded')

  // 2. Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@predictly.io' },
    update: {},
    create: {
      email: 'demo@predictly.io',
      handle: 'DemoTrader',
      name: 'DemoTrader',
      passwordHash: hashPassword('demo1234'),
      authProvider: 'email',
      gcBalance: 50000,
      scBalance: 2500,
      userTier: 'gold',
      ageVerified: true,
      referralCode: 'PRED-DEMO2026',
      isAdmin: false,
    },
  })
  console.log('✅ Demo user created')

  // 3. Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@predictly.io' },
    update: {},
    create: {
      email: 'admin@predictly.io',
      handle: 'Admin',
      name: 'Predictly Admin',
      passwordHash: hashPassword('admin1234'),
      authProvider: 'email',
      gcBalance: 0,
      scBalance: 0,
      userTier: 'diamond',
      ageVerified: true,
      isAdmin: true,
    },
  })
  console.log('✅ Admin user created')

  // 4. Create promo codes
  const promoCodes = [
    { code: 'WELCOME50', description: '50% bonus on first GC purchase', discount_type: 'PERCENTAGE', discount_value: 50, max_redemptions: 1000 },
    { code: 'FREE5000GC', description: '5,000 free Gold Coins', discount_type: 'FIXED_GC', discount_value: 5000, max_redemptions: 500 },
    { code: 'SCBONUS25', description: '25 free Sweeps Coins', discount_type: 'FIXED_SC', discount_value: 25, max_redemptions: 200 },
    { code: 'PREDICTLY2026', description: 'Welcome promotion - 10,000 GC + 50 SC', discount_type: 'FIXED_GC', discount_value: 10000, max_redemptions: 10000 },
    { code: 'LAUNCH100', description: '100 SC bonus for early adopters', discount_type: 'FIXED_SC', discount_value: 100, max_redemptions: 100 },
  ]

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: { ...promo, is_active: true, created_by: 'admin' },
    })
  }
  console.log('✅ Promo codes seeded')

  // 5. Create GC packages
  const gcPackages = [
    { label: 'Starter', gcAmount: 1000, scBonus: 5, priceUsd: 4.99, isPopular: false, sortOrder: 1 },
    { label: 'Bronze', gcAmount: 5000, scBonus: 25, priceUsd: 19.99, isPopular: false, sortOrder: 2 },
    { label: 'Silver', gcAmount: 15000, scBonus: 75, priceUsd: 49.99, isPopular: true, sortOrder: 3 },
    { label: 'Gold', gcAmount: 40000, scBonus: 200, priceUsd: 99.99, isPopular: false, sortOrder: 4 },
    { label: 'Diamond', gcAmount: 100000, scBonus: 500, priceUsd: 249.99, isPopular: false, sortOrder: 5 },
  ]

  for (const pkg of gcPackages) {
    // Use label as a unique identifier since id is autoincrement
    const existing = await prisma.gcPackage.findFirst({ where: { label: pkg.label } })
    if (!existing) {
      await prisma.gcPackage.create({ data: pkg })
    }
  }
  console.log('✅ GC packages seeded')

  // 6. Create sample markets
  const markets = [
    { id: 'm-btc-200k', slug: 'bitcoin-200k-by-2026', question: 'Will Bitcoin reach $200,000 by end of 2026?', status: 'active', yesPoolSc: 610000, noPoolSc: 370000, yesProbability: 0.62, noProbability: 0.38, totalVolumeSc: 23200000, totalTraders: 18742, categoryId: 2 },
    { id: 'm-election-2028', slug: 'us-president-2028', question: 'Who will win the 2028 US Presidential Election?', status: 'active', yesPoolSc: 1150000, noPoolSc: 1150000, yesProbability: 0.34, noProbability: 0.66, totalVolumeSc: 50800000, totalTraders: 41293, categoryId: 1 },
    { id: 'm-fed-cut-jun', slug: 'fed-rate-cut-june-2026', question: 'Will the Fed cut rates at the June 2026 FOMC meeting?', status: 'active', yesPoolSc: 193000, noPoolSc: 217000, yesProbability: 0.47, noProbability: 0.53, totalVolumeSc: 7700000, totalTraders: 6421, categoryId: 5 },
    { id: 'm-gpt-5-2026', slug: 'openai-gpt5-by-q2-2026', question: 'Will OpenAI release GPT-5 before July 2026?', status: 'active', yesPoolSc: 156000, noPoolSc: 64000, yesProbability: 0.71, noProbability: 0.29, totalVolumeSc: 3400000, totalTraders: 3117, categoryId: 4 },
    { id: 'm-ukraine-ceasefire', slug: 'ukraine-ceasefire-2026', question: 'Will there be a verified Russia-Ukraine ceasefire by end of 2026?', status: 'active', yesPoolSc: 222000, noPoolSc: 318000, yesProbability: 0.41, noProbability: 0.59, totalVolumeSc: 16100000, totalTraders: 11204, categoryId: 8 },
  ]

  for (const market of markets) {
    await prisma.market.upsert({
      where: { id: market.id },
      update: {},
      create: {
        ...market,
        safetyScore: 85,
        expiresAt: new Date('2026-12-31T23:59:00Z'),
      },
    })
  }
  console.log('✅ Markets seeded')

  // 7. Create welcome transactions for demo user
  // Check if welcome transactions already exist for demo user
  const existingTxCount = await prisma.transaction.count({
    where: { userId: demoUser.id, type: { in: ['SC_BONUS', 'GC_PURCHASE'] } },
  })
  if (existingTxCount === 0) {
    await prisma.transaction.createMany({
      data: [
        { userId: demoUser.id, type: 'SC_BONUS', amount: 2500, currency: 'SC', description: 'Welcome bonus - Free Sweeps Coins', status: 'completed' },
        { userId: demoUser.id, type: 'GC_PURCHASE', amount: 50000, currency: 'GC', description: 'Welcome bonus - Free Gold Coins', status: 'completed' },
      ],
    })
  }
  console.log('✅ Welcome transactions seeded')

  console.log('\n🎉 Seeding complete!')
  console.log('Demo user: demo@predictly.io / demo1234')
  console.log('Admin user: admin@predictly.io / admin1234')
  console.log('Promo codes: WELCOME50, FREE5000GC, SCBONUS25, PREDICTLY2026, LAUNCH100')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
