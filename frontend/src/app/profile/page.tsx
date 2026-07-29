import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import { getGrade, formatTime } from '@/lib/scoring'
import { Trophy, Target, Clock, Play, TrendingUp, Star, Medal, Gamepad2, AlertTriangle } from 'lucide-react'

export default async function ProfilePage() {
  const session = await auth()
  const userId = session!.user!.id as string

  const [user, attempts, leaderboardEntries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, role: true, createdAt: true },
    }),
    prisma.attempt.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { quiz: { select: { id: true, title: true, totalPoints: true } } },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.leaderboardEntry.findMany({
      where: { userId },
      include: { quiz: { select: { title: true } } },
      orderBy: { score: 'desc' },
    }),
  ])

  const totalScore = attempts.reduce((s, a) => s + a.score, 0)
  const avgAccuracy = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length)
    : 0
  const avgTime = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.timeTaken, 0) / attempts.length)
    : 0
  const bestScore = attempts.length ? Math.max(...attempts.map(a => a.score)) : 0
  const { grade, color } = getGrade(avgAccuracy)

  // Streak (consecutive days)
  const daySet = new Set(
    attempts
      .filter(a => a.completedAt)
      .map(a => new Date(a.completedAt!).toDateString())
  )
  const streak = daySet.size

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 pt-14 lg:pt-0 overflow-auto">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="card mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/5" />
            <div className="relative flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white flex-shrink-0 shadow-lg shadow-violet-500/30">
                {user?.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black text-white">{user?.name}</h1>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`badge text-xs px-3 py-1 rounded-full font-bold border ${
                    user?.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    user?.role === 'CREATOR' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>{user?.role}</span>
                  <span className="text-gray-600 text-xs">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                  </span>
                </div>
              </div>
              {/* Grade */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Overall Grade</p>
                <p className="text-5xl font-black" style={{ color }}>{grade}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Play, label: 'Quizzes Played', value: attempts.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { icon: Trophy, label: 'Total Score', value: totalScore.toLocaleString(), color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { icon: Target, label: 'Avg Accuracy', value: `${avgAccuracy}%`, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
              { icon: Clock, label: 'Avg Time', value: `${avgTime}s`, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { icon: Star, label: 'Best Score', value: bestScore.toLocaleString(), color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
              { icon: TrendingUp, label: 'Days Active', value: streak, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`card border ${bg} flex items-center gap-4`}>
                <div className={`p-3 rounded-xl ${bg}`}><Icon size={20} className={color} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Personal Bests */}
          {leaderboardEntries.length > 0 && (
            <div className="card mb-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-amber-400" /> Personal Bests
              </h2>
              <div className="space-y-2">
                {leaderboardEntries.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                    <span className={`flex justify-center items-center flex-shrink-0 w-6 ${
                      i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600 font-black text-lg'
                    }`}>
                      {i === 0 ? <Medal size={20} /> : i === 1 ? <Medal size={20} /> : i === 2 ? <Medal size={20} /> : `${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{entry.quiz.title}</p>
                      <p className="text-xs text-gray-500">{Math.round(entry.accuracy)}% accuracy · {entry.timeTaken}s</p>
                    </div>
                    <p className="font-black text-amber-400 flex-shrink-0">{entry.score.toLocaleString()} pts</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz History */}
          <div className="card">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Play size={18} className="text-blue-400" /> Quiz History
            </h2>
            {attempts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">You haven&apos;t played any quizzes yet!</p>
                <Link href="/quizzes" className="btn-primary inline-flex items-center gap-2">
                  <Gamepad2 size={18} /> Start Playing
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {attempts.map(attempt => {
                  const { grade: g, color: c } = getGrade(attempt.accuracy)
                  return (
                    <div key={attempt.id} className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors group">
                      {/* Grade pill */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                        style={{ backgroundColor: `${c}20`, color: c, border: `1px solid ${c}30` }}>
                        {g}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate group-hover:text-violet-400 transition-colors">
                          {attempt.quiz.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(attempt.completedAt!).toLocaleDateString()} ·
                          {Math.round(attempt.accuracy)}% accuracy ·
                          {formatTime(attempt.timeTaken)}
                          {attempt.tabSwitches > 0 && <span className="text-amber-500 ml-1 inline-flex items-center gap-0.5"><AlertTriangle size={11} /> {attempt.tabSwitches} flag{attempt.tabSwitches > 1 ? 's' : ''}</span>}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-amber-400">{attempt.score.toLocaleString()} pts</p>
                        <Link href={`/results/${attempt.id}`} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                          Details →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
