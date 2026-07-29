// src/app/api/attempts/[attemptId]/answer/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcPoints } from '@/lib/scoring'

export async function POST(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { attemptId } = await params

  const { questionId, optionId, timeSpent } = await req.json()

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { include: { questions: { include: { options: true } } } } },
  })
  if (!attempt || attempt.userId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (attempt.status !== 'IN_PROGRESS')
    return NextResponse.json({ error: 'Attempt already completed' }, { status: 400 })

  const question = attempt.quiz.questions.find(q => q.id === questionId)
  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  const selectedOption = question.options.find(o => o.id === optionId)
  const isCorrect = selectedOption?.isCorrect ?? false
  const pointsEarned = isCorrect
    ? calcPoints(question.points, question.timeLimit, timeSpent || 0)
    : 0

  await prisma.answer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: { optionId, isCorrect, pointsEarned, timeSpent: timeSpent || 0 },
    create: { attemptId, questionId, optionId, isCorrect, pointsEarned, timeSpent: timeSpent || 0 },
  })

  // Check if all questions answered → complete attempt
  const allAnswers = await prisma.answer.findMany({ where: { attemptId } })
  const totalQ = attempt.quiz.questions.length

  if (allAnswers.length >= totalQ) {
    const totalScore = allAnswers.reduce((s, a) => s + a.pointsEarned, 0)
    const correctCount = allAnswers.filter(a => a.isCorrect).length
    const accuracy = (correctCount / totalQ) * 100
    const totalTime = allAnswers.reduce((s, a) => s + a.timeSpent, 0)

    await prisma.attempt.update({
      where: { id: attemptId },
      data: { status: 'COMPLETED', score: totalScore, accuracy, timeTaken: totalTime, completedAt: new Date() },
    })

    // Upsert leaderboard entry (keep best score)
    const existing = await prisma.leaderboardEntry.findUnique({
      where: { userId_quizId: { userId: attempt.userId, quizId: attempt.quizId } },
    })
    if (!existing || totalScore > existing.score) {
      await prisma.leaderboardEntry.upsert({
        where: { userId_quizId: { userId: attempt.userId, quizId: attempt.quizId } },
        update: { score: totalScore, accuracy, timeTaken: totalTime },
        create: { userId: attempt.userId, quizId: attempt.quizId, score: totalScore, accuracy, timeTaken: totalTime },
      })
    }
  }

  return NextResponse.json({ isCorrect, pointsEarned, correctOptionId: question.options.find(o => o.isCorrect)?.id })
}
