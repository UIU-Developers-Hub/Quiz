// src/app/api/leaderboard/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const quizId = searchParams.get('quizId')

  const entries = await prisma.leaderboardEntry.findMany({
    where: quizId ? { quizId } : {},
    include: { user: { select: { name: true, image: true } }, quiz: { select: { title: true } } },
    orderBy: { score: 'desc' },
    take: 50,
  })

  // Add rank
  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }))
  return NextResponse.json(ranked)
}
