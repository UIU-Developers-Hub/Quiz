import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Trophy, Play, TrendingUp, Hand, Flame, ClipboardList } from 'lucide-react'
export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id as string

  const [quizCount, myAttempts, topQuizzes] = await Promise.all([
    prisma.quiz.count({ where: { visibility: 'PUBLIC' } }),
    prisma.attempt.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { quiz: { select: { title: true } } },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
    prisma.quiz.findMany({
      where: { visibility: 'PUBLIC' },
      include: { _count: { select: { questions: true } } },
      orderBy: { playCount: 'desc' },
      take: 6,
    }),
  ])

  const totalScore = myAttempts.reduce((s, a) => s + a.score, 0)
  const avgAccuracy = myAttempts.length
    ? Math.round(myAttempts.reduce((s, a) => s + a.accuracy, 0) / myAttempts.length)
    : 0

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2">
          Welcome back, <span className="text-violet-400">{session?.user?.name?.split(' ')[0]}</span> <Hand className="w-8 h-8 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400">Here&apos;s your quiz overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Public Quizzes', value: quizCount, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { icon: Play, label: 'Quizzes Played', value: myAttempts.length, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { icon: Trophy, label: 'Total Score', value: totalScore.toLocaleString(), color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { icon: TrendingUp, label: 'Avg Accuracy', value: `${avgAccuracy}%`, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`card border ${bg} flex items-center gap-4`}>
            <div className={`p-3 rounded-xl ${bg}`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Popular Quizzes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" /> Popular Quizzes</h2>
          <Link href="/quizzes" className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topQuizzes.map(quiz => (
            <div key={quiz.id} className="card hover:border-violet-500/40 transition-all duration-200 hover:-translate-y-1 group">
              <div className="flex items-start justify-between mb-3">
                <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20">{quiz.category}</span>
                <span className="text-xs text-gray-500">{quiz.playCount} plays</span>
              </div>
              <h3 className="font-bold text-white mb-1 group-hover:text-violet-400 transition-colors line-clamp-2">{quiz.title}</h3>
              {quiz.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>
              )}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
                <span className="text-xs text-gray-500">{quiz._count.questions} questions</span>
                <Link href={`/quizzes/${quiz.id}`}
                  className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                  Play now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {myAttempts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-400" /> Recent Activity</h2>
          <div className="card divide-y divide-gray-800">
            {myAttempts.map(attempt => (
              <div key={attempt.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold text-white">{attempt.quiz.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(attempt.completedAt!).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-amber-400">{attempt.score.toLocaleString()} pts</p>
                    <p className="text-xs text-gray-500">{Math.round(attempt.accuracy)}% accuracy</p>
                  </div>
                  <Link href={`/results/${attempt.id}`}
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
