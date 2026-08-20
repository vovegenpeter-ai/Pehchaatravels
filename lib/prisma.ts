import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured')
  }

  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// Lazy singleton using a Proxy that properly forwards all operations
// to the real PrismaClient instance.
export const prisma: PrismaClient = new Proxy<PrismaClient>({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getClient()

    // Handle special symbol properties (e.g. Symbol.toPrimitive)
    if (typeof prop === 'symbol') {
      return Reflect.get(client, prop, client)
    }

    // Access the property directly from the real client
    const value = client[prop as keyof PrismaClient]

    if (typeof value === 'function') {
      return value.bind(client)
    }

    return value
  },
})
