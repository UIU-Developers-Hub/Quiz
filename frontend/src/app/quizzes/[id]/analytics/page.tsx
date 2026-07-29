import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import { ArrowLeft, Users, Target, Clock, Trophy, XCircle, BarChart2, Medal } from 'lucide-react'

export default async function QuizAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true } },
      questions: {
        include: {
          options: true,
          answers: { include: { option: true } },
        },
        orderBy: { order: 'asc' },
      },
      attempts: {
        where: { status: 'COMPLETED' },
        include: { user: { select: { name: true } } },
        orderBy: { score: 'desc' },
      },
    },
  })

  if (!quiz) notFound()
  const role = session?.user?.role
  if (quiz.creatorId !== session?.user?.id && role !== 'ADMIN') redirect('/dashboard')

  const completedAttempts = quiz.attempts
  const avgScore = completedAttempts.length
    ? Math.round(completedAttempts.reduce((s, a) => s + a.score, 0) / completedAttempts.length)
    : 0
  const avgAccuracy = completedAttempts.length
    ? Math.round(completedAttempts.reduce((s, a) => s + a.accuracy, 0) / completedAttempts.length)
    : 0
  const avgTime = completedAttempts.length
    ? Math.round(completedAttempts.reduce((s, a) => s + a.timeTaken, 0) / completedAttempts.length)
    : 0

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 pt-14 lg:pt-0 overflow-auto">
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Link href="/my-quizzes" className="text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <p className="text-gray-400 text-sm">My Quizzes</p>
          </div>
          <h1 className="text-3xl font-black text-white mb-1">{quiz.title}</h1>
          <p className="text-gray-400 mb-8">Analytics & Performance</p>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, label: 'Total Plays', value: completedAttempts.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { icon: Trophy, label: 'Avg Score', value: avgScore.toLocaleString(), color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { icon: Target, label: 'Avg Accuracy', value: `${avgAccuracy}%`, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
              { icon: Clock, label: 'Avg Time', value: `${avgTime}s`, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`card border ${bg} flex items-center gap-4`}>
                <div className={`p-3 rounded-xl ${bg}`}><Icon size={20} className={color} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase">{label}</p>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Per-question accuracy */}
          <div className="card mb-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-400" /> Question-by-Question Accuracy</h2>
            {quiz.questions.length === 0 ? (
              <p className="text-gray-500 text-sm">No questions yet.</p>
            ) : (
              <div className="space-y-4">
                {quiz.questions.map((q, i) => {
                  const total = q.answers.length
                  const correct = q.answers.filter(a => a.isCorrect).length
                  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
                  const barColor = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'

                  // Find most-picked wrong answer
                  const wrongPicks = q.options.filter(o => !o.isCorrect).map(o => ({
                    text: o.text,
                    count: q.answers.filter(a => a.optionId === o.id && !a.isCorrect).length,
                  })).sort((a, b) => b.count - a.count)
                  const topWrong = wrongPicks[0]

                  return (
                    <div key={q.id} className="p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <p className="font-semibold text-white text-sm flex-1">
                          <span className="text-gray-500 mr-2">Q{i + 1}.</span>
                          {q.text}
                        </p>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-black text-lg" style={{ color: barColor }}>{pct}%</p>
                          <p className="text-xs text-gray-500">{correct}/{total} correct</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                      {topWrong && topWrong.count > 0 && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <XCircle size={11} className="text-red-400" />
                          Most common wrong answer: <span className="text-red-400 font-medium">&quot;{topWrong.text}&quot;</span>
                          <span className="text-gray-600">({topWrong.count}×)</span>
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top Players */}
          {completedAttempts.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Top Players</h2>
              <div className="space-y-2">
                {completedAttempts.slice(0, 10).map((attempt, i) => (
                  <div key={attempt.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                    <span className={`flex justify-center items-center flex-shrink-0 w-8 ${
                      i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600 font-black text-xl'
                    }`}>
                      {i === 0 ? <Medal size={24} /> : i === 1 ? <Medal size={24} /> : i === 2 ? <Medal size={24} /> : `#${i + 1}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-violet-600/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {attempt.user.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{attempt.user.name}</p>
                      <p className="text-xs text-gray-500">{Math.round(attempt.accuracy)}% accuracy · {attempt.timeTaken}s</p>
                    </div>
                    <p className="font-black text-amber-400 flex-shrink-0">{attempt.score.toLocaleString()} pts</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
