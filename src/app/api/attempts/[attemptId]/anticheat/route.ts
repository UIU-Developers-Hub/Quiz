// src/app/api/attempts/[attemptId]/anticheat/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { attemptId } = await params

  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } })
  if (!attempt || attempt.userId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.attempt.update({
    where: { id: attemptId },
    data: { tabSwitches: { increment: 1 } },
  })
  return NextResponse.json({ tabSwitches: attempt.tabSwitches + 1 })
}
