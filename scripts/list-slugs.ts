import { prisma } from '../lib/prisma'

async function main() {
  const [t, h, d, c] = await Promise.all([
    prisma.tour.findMany({ select: { slug: true } }),
    prisma.hotel.findMany({ select: { slug: true } }),
    prisma.destination.findMany({ select: { slug: true } }),
    prisma.category.findMany({ select: { slug: true, type: true } }),
  ])
  console.log('TOURS=' + t.map((x) => x.slug).join(','))
  console.log('HOTELS=' + h.map((x) => x.slug).join(','))
  console.log('DESTS=' + d.map((x) => x.slug).join(','))
  console.log('CATS=' + c.map((x) => x.slug).join(','))
  await prisma.$disconnect()
  process.exit(0)
}
main()
