// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'


function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: 'file:prisma/dev.db' })
  return new PrismaClient({ adapter, log: ['error'] } as unknown as ConstructorParameters<typeof PrismaClient>[0])
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
