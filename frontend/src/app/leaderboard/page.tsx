'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Trophy, Medal } from 'lucide-react'

interface Entry {
  id: string; rank: number; score: number; accuracy: number; timeTaken: number
  user: { name: string; image: string | null }
  quiz: { title: string }
}

function LeaderboardContent() {
  const searchParams = useSearchParams()
  const quizId = searchParams.get('quizId')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = quizId ? `/api/leaderboard?quizId=${quizId}` : '/api/leaderboard'
    fetch(url).then(r => r.json()).then(data => { setEntries(data); setLoading(false) })
  }, [quizId])

  const rankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">
          {quizId ? '🏆 Quiz Leaderboard' : '🌍 Global Leaderboard'}
        </h1>
        <p className="text-gray-400">Top players ranked by highest score</p>
      </div>

      {loading ? (
        <div className="card animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full" />
              <div className="flex-1 h-4 bg-gray-800 rounded" />
              <div className="w-20 h-4 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <Trophy size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg">No scores yet. Be the first!</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-800">
          {entries.map((entry, i) => (
            <div key={entry.id}
              className={`flex items-center gap-4 py-4 first:pt-0 last:pb-0 ${i < 3 ? 'opacity-100' : 'opacity-80'}`}>
              {/* Rank */}
              <div className={`text-2xl font-black w-10 text-center flex-shrink-0 ${
                i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'
              }`}>
                {rankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-violet-600/50 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {entry.user.name[0]?.toUpperCase()}
              </div>

              {/* Name + Quiz */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{entry.user.name}</p>
                {!quizId && <p className="text-xs text-gray-500 truncate">{entry.quiz.title}</p>}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-right flex-shrink-0">
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500">Accuracy</p>
                  <p className="font-semibold text-green-400">{Math.round(entry.accuracy)}%</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-semibold text-blue-400">{entry.timeTaken}s</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="text-xl font-black text-amber-400">{entry.score.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading leaderboard...</div>}>
      <LeaderboardContent />
    </Suspense>
  )
}
