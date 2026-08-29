/**
 * Run this script to add the 3 main Places categories and their subcategories:
 *
 *   npx tsx prisma/seed-categories.ts
 *
 * It uses upserts so it's safe to run multiple times.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding Places categories...')

  /* === Main Categories === */

  const kashmir = await prisma.category.upsert({
    where: { slug: 'kashmir' },
    update: {},
    create: {
      name: 'Kashmir',
      slug: 'kashmir',
      type: 'DESTINATION',
      description: 'Paradise on Earth — lush valleys, pristine lakes, and breathtaking mountain landscapes',
    },
  })
  console.log(`✅ Kashmir (${kashmir.id})`)

  const kpk = await prisma.category.upsert({
    where: { slug: 'khyber-pakhtunkhwa' },
    update: {},
    create: {
      name: 'Khyber Pakhtunkhwa',
      slug: 'khyber-pakhtunkhwa',
      type: 'DESTINATION',
      description: 'Land of hospitality — from Swat Valley to the majestic Hindu Kush range',
    },
  })
  console.log(`✅ Khyber Pakhtunkhwa (${kpk.id})`)

  const gilgitBaltistan = await prisma.category.upsert({
    where: { slug: 'gilgit-baltistan' },
    update: {},
    create: {
      name: 'Gilgit-Baltistan',
      slug: 'gilgit-baltistan',
      type: 'DESTINATION',
      description: 'Roof of the World — home to K2, Deosai, and the legendary Karakoram Highway',
    },
  })
  console.log(`✅ Gilgit-Baltistan (${gilgitBaltistan.id})`)

  /* === Kashmir Subcategories === */

  await prisma.category.upsert({
    where: { slug: 'neelum-valley' },
    update: {},
    create: {
      name: 'Neelum Valley',
      slug: 'neelum-valley',
      type: 'DESTINATION',
      description: 'A lush green valley with turquoise rivers and picturesque villages',
      parentId: kashmir.id,
    },
  })
  console.log('  ✅ Neelum Valley')

  await prisma.category.upsert({
    where: { slug: 'leepa-valley' },
    update: {},
    create: {
      name: 'Leepa Valley',
      slug: 'leepa-valley',
      type: 'DESTINATION',
      description: 'Hidden gem with terraced fields and traditional wooden houses',
      parentId: kashmir.id,
    },
  })
  console.log('  ✅ Leepa Valley')

  await prisma.category.upsert({
    where: { slug: 'muzaffarabad' },
    update: {},
    create: {
      name: 'Muzaffarabad',
      slug: 'muzaffarabad',
      type: 'DESTINATION',
      description: 'Capital of Azad Kashmir at the confluence of two rivers',
      parentId: kashmir.id,
    },
  })
  console.log('  ✅ Muzaffarabad')

  /* === KPK Subcategories === */

  await prisma.category.upsert({
    where: { slug: 'swat' },
    update: {},
    create: {
      name: 'Swat Valley',
      slug: 'swat',
      type: 'DESTINATION',
      description: 'The Switzerland of Pakistan — alpine meadows and crystal-clear lakes',
      parentId: kpk.id,
    },
  })
  console.log('  ✅ Swat Valley')

  await prisma.category.upsert({
    where: { slug: 'chitral' },
    update: {},
    create: {
      name: 'Chitral',
      slug: 'chitral',
      type: 'DESTINATION',
      description: 'Remote valleys, Kalash culture, and the stunning Tirich Mir peak',
      parentId: kpk.id,
    },
  })
  console.log('  ✅ Chitral')

  /* === Gilgit-Baltistan Subcategories === */

  await prisma.category.upsert({
    where: { slug: 'hunza' },
    update: {},
    create: {
      name: 'Hunza Valley',
      slug: 'hunza',
      type: 'DESTINATION',
      description: 'Fairy-tale valley with ancient forts, turquoise lakes, and warm hospitality',
      parentId: gilgitBaltistan.id,
    },
  })
  console.log('  ✅ Hunza Valley')

  await prisma.category.upsert({
    where: { slug: 'skardu' },
    update: {},
    create: {
      name: 'Skardu',
      slug: 'skardu',
      type: 'DESTINATION',
      description: 'Gateway to K2 — cold desert, Shangrila Resort, and mighty Karakoram peaks',
      parentId: gilgitBaltistan.id,
    },
  })
  console.log('  ✅ Skardu')

  await prisma.category.upsert({
    where: { slug: 'deosai' },
    update: {},
    create: {
      name: 'Deosai Plains',
      slug: 'deosai',
      type: 'DESTINATION',
      description: 'Second highest plateau in the world — wildflowers, marmots, and golden bears',
      parentId: gilgitBaltistan.id,
    },
  })
  console.log('  ✅ Deosai Plains')

  console.log('\n🎉 All categories seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
