// src/app/results/[attemptId]/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGrade, formatTime } from '@/lib/scoring'
import { Trophy, Clock, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import ResultsClientExtras from './ResultsClientExtras'

export default async function ResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const session = await auth()
  const { attemptId } = await params

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: { include: { options: true }, orderBy: { order: 'asc' } },
        },
      },
      answers: { include: { option: true, question: { include: { options: true } } } },
    },
  })

  if (!attempt || attempt.userId !== session?.user?.id) notFound()

  const { grade, color } = getGrade(attempt.accuracy)
  const correctCount = attempt.answers.filter(a => a.isCorrect).length
  const passed = attempt.accuracy >= (attempt.quiz.passPercent ?? 60)

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Score Card */}
        <div className="card mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/5" />
          <div className="relative">
            <div className="text-6xl font-black mb-2" style={{ color }}>
              {grade}
            </div>
            <h1 className="text-2xl font-black text-white mb-1">{attempt.quiz.title}</h1>
            <p className="text-gray-400 mb-6">
              {passed ? '🎉 Quiz Passed!' : '❌ Quiz Failed — Try Again!'}
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Trophy, label: 'Score', value: attempt.score.toLocaleString() + ' pts', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { icon: Target, label: 'Accuracy', value: `${Math.round(attempt.accuracy)}%`, color: 'text-green-400', bg: 'bg-green-500/10' },
                { icon: Clock, label: 'Time', value: formatTime(attempt.timeTaken), color: 'text-blue-400', bg: 'bg-blue-500/10' },
              ].map(({ icon: Icon, label, value, color: c, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <Icon size={20} className={`${c} mx-auto mb-2`} />
                  <p className={`text-2xl font-black ${c}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Pass threshold info */}
            <div className={`mt-4 rounded-xl p-3 text-sm border ${passed ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              Pass threshold: {attempt.quiz.passPercent ?? 60}% accuracy — You scored {Math.round(attempt.accuracy)}%
            </div>

            {attempt.tabSwitches > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <AlertTriangle size={16} />
                <span>Tab switched <strong>{attempt.tabSwitches}</strong> time{attempt.tabSwitches > 1 ? 's' : ''} — flagged</span>
              </div>
            )}
          </div>
        </div>

        {/* Certificate unlock check — client component */}
        {passed && attempt.quiz.language && (
          <ResultsClientExtras language={attempt.quiz.language} />
        )}

        {/* Per-question breakdown */}
        <div className="card mb-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            📊 Question Breakdown
            <span className="text-sm font-normal text-gray-400 ml-auto">
              {correctCount}/{attempt.quiz.questions.length} correct
            </span>
          </h2>
          <div className="space-y-3">
            {attempt.quiz.questions.map((q, i) => {
              const ans = attempt.answers.find(a => a.questionId === q.id)
              const correctOpt = q.options.find(o => o.isCorrect)
              return (
                <div key={q.id} className={`p-4 rounded-xl border ${
                  !ans ? 'border-gray-700 bg-gray-800/30' :
                  ans.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {!ans ? <span className="text-gray-500">⏰</span> :
                        ans.isCorrect ? <CheckCircle size={18} className="text-green-400" /> :
                          <XCircle size={18} className="text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white mb-1">Q{i + 1}. {q.text}</p>
                      {ans?.option && (
                        <p className={`text-xs ${ans.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          Your answer: {ans.option.text}
                        </p>
                      )}
                      {ans && !ans.isCorrect && correctOpt && (
                        <p className="text-xs text-green-400 mt-0.5">Correct: {correctOpt.text}</p>
                      )}
                      {!ans && <p className="text-xs text-gray-500">Not answered (time up)</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-amber-400">+{ans?.pointsEarned || 0}</p>
                      {ans && <p className="text-xs text-gray-500">{ans.timeSpent}s</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/quizzes" className="btn-secondary text-center flex-1">← Browse Quizzes</Link>
          <Link href="/certificates" className="btn-secondary text-center flex-1">
            🏆 My Certificates
          </Link>
          <Link href={`/quizzes/${attempt.quizId}`} className="btn-primary text-center flex-1">
            🔄 Play Again
          </Link>
        </div>
      </div>
    </div>
  )
}
