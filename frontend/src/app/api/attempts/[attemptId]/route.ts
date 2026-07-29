// src/app/api/attempts/[attemptId]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { attemptId } = await params

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: { questions: { include: { options: true }, orderBy: { order: 'asc' } } },
      },
      answers: true,
    },
  })
  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (attempt.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Strip isCorrect from options during active quiz (anti-cheat)
  if (attempt.status === 'IN_PROGRESS') {
    const sanitized = {
      ...attempt,
      quiz: {
        ...attempt.quiz,
        questions: attempt.quiz.questions.map(q => ({
          ...q,
          options: q.options.map(({ isCorrect: _, ...o }) => o),
        })),
      },
    }
    return NextResponse.json(sanitized)
  }

  return NextResponse.json(attempt)
}
