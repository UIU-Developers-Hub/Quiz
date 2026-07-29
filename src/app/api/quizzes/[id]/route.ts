// src/app/api/quizzes/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true, image: true } },
      questions: { include: { options: true }, orderBy: { order: 'asc' } },
      _count: { select: { attempts: true } },
    },
  })
  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quiz)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const quiz = await prisma.quiz.findUnique({ where: { id } })
  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (quiz.creatorId !== session.user.id && (session.user as any).role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.quiz.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
