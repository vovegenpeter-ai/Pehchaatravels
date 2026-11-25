import { prisma } from '../lib/prisma'
async function main() {
  for (let i = 1; i <= 5; i++) {
    const t0 = Date.now()
    try {
      const n: any = await Promise.race([
        prisma.tour.count(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT 20s')), 20000)),
      ])
      console.log(`attempt ${i}: OK count=${n} in ${Date.now() - t0}ms`)
    } catch (e: any) {
      console.log(`attempt ${i}: FAIL in ${Date.now() - t0}ms -> ${String(e.message).split('\n')[0].slice(0, 180)}`)
    }
  }
  await prisma.$disconnect().catch(() => {})
  process.exit(0)
}
main()
