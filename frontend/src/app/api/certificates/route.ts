// src/app/api/certificates/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** GET /api/certificates — list current user's certificates */
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const certs = await prisma.certificate.findMany({
    where: { userId: session.user.id as string },
    orderBy: { earnedAt: 'desc' },
  })
  return NextResponse.json(certs)
}
