// src/app/api/quizzes/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const quizzes = await prisma.quiz.findMany({
    where: {
      visibility: 'PUBLIC',
      ...(category ? { category } : {}),
    },
    include: {
      creator: { select: { name: true, image: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { playCount: 'desc' },
  })
  return NextResponse.json(quizzes)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['ADMIN', 'CREATOR'].includes((session.user as any).role as string))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, description, category, visibility, timePerQ, questions } = body

  // Calculate totalPoints
  const totalPoints = (questions || []).reduce((s: number, q: any) => s + (q.points || 100), 0)

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      category: category || 'General',
      visibility: visibility || 'DRAFT',
      timePerQ: timePerQ || 20,
      totalPoints,
      creatorId: session.user.id as string,
      questions: {
        create: (questions || []).map((q: any, i: number) => ({
          text: q.text,
          type: q.type || 'MULTIPLE_CHOICE',
          points: q.points || 100,
          timeLimit: q.timeLimit || timePerQ || 20,
          order: i,
          explanation: q.explanation,
          options: {
            create: q.options.map((o: any, j: number) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: j,
            })),
          },
        })),
      },
    },
    include: { questions: { include: { options: true } } },
  })

  return NextResponse.json(quiz, { status: 201 })
}
