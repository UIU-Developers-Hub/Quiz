// src/app/api/quizzes/[id]/publish/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const quiz = await prisma.quiz.findUnique({ where: { id } })
  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (quiz.creatorId !== session.user.id && (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const toggled = quiz.visibility === 'PUBLIC' ? 'DRAFT' : 'PUBLIC'
  const updated = await prisma.quiz.update({
    where: { id },
    data: { visibility: toggled },
    select: { id: true, visibility: true },
  })
  return NextResponse.json(updated)
}
