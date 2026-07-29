// src/app/api/certificates/check/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/certificates/check
 * Body: { language: string }
 * 
 * Checks if the user has passed all 3 levels (SIMPLE, NORMAL, HARD)
 * of the given language quiz. If so, issues a certificate.
 * Returns { eligible, alreadyHad, certificate? }
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id as string

  const body = await req.json()
  const { language } = body as { language: string }
  if (!language) return NextResponse.json({ error: 'language required' }, { status: 400 })

  // Get all quizzes for this language (SIMPLE, NORMAL, HARD)
  const quizzes = await prisma.quiz.findMany({
    where: { language, category: 'Programming', visibility: 'PUBLIC' },
    select: { id: true, level: true, passPercent: true, totalPoints: true },
  })

  const levels = ['SIMPLE', 'NORMAL', 'HARD'] as const
  const levelMap = new Map(quizzes.map(q => [q.level, q]))

  // Check all 3 levels exist for this language
  const hasAllLevels = levels.every(l => levelMap.has(l))
  if (!hasAllLevels) {
    return NextResponse.json({ eligible: false, reason: 'Missing quiz levels' })
  }

  // For each level, check if user has a COMPLETED attempt with accuracy >= passPercent
  const passResults: boolean[] = await Promise.all(
    levels.map(async (level) => {
      const quiz = levelMap.get(level)!
      const bestAttempt = await prisma.attempt.findFirst({
        where: { userId, quizId: quiz.id, status: 'COMPLETED' },
        orderBy: { accuracy: 'desc' },
      })
      return bestAttempt !== null && bestAttempt.accuracy >= (quiz.passPercent ?? 60)
    })
  )

  const eligible = passResults.every(Boolean)

  if (!eligible) {
    return NextResponse.json({
      eligible: false,
      passed: passResults,
      levels,
      reason: 'Not all levels passed',
    })
  }

  // Check if certificate already exists
  const existing = await prisma.certificate.findUnique({
    where: { userId_language: { userId, language } },
  })

  if (existing) {
    return NextResponse.json({ eligible: true, alreadyHad: true, certificate: existing })
  }

  // Issue new certificate
  const certificate = await prisma.certificate.create({
    data: { userId, language },
  })

  return NextResponse.json({ eligible: true, alreadyHad: false, certificate })
}
