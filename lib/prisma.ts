import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma Client with optimized connection pooling for Supabase
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown - disconnect on process termination
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

// Transaction helper with retry logic
export async function executeTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(fn, {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
        isolationLevel: 'Serializable',
      })
      return result as T
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
      }
    }
  }
  
  throw lastError
}
