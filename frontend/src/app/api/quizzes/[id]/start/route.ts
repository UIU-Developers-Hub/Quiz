// src/app/api/quizzes/[id]/start/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: { id: true, visibility: true },
  })
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

  // Abandon any previous IN_PROGRESS attempt for this user/quiz
  await prisma.attempt.updateMany({
    where: { userId: session.user.id as string, quizId: id, status: 'IN_PROGRESS' },
    data: { status: 'ABANDONED' },
  })

  const attempt = await prisma.attempt.create({
    data: { userId: session.user.id as string, quizId: id, status: 'IN_PROGRESS' },
  })

  // Increment play count
  await prisma.quiz.update({ where: { id }, data: { playCount: { increment: 1 } } })

  return NextResponse.json({ attemptId: attempt.id })
}
