'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Clock, Trophy, Play, Users } from 'lucide-react'

interface Quiz {
  id: string; title: string; description: string; category: string
  timePerQ: number; totalPoints: number; playCount: number
  creator: { name: string }
  questions: { id: string }[]
  _count: { attempts: number }
}

export default function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [quizId, setQuizId] = useState('')

  useEffect(() => {
    params.then(({ id }) => {
      setQuizId(id)
      fetch(`/api/quizzes/${id}`).then(r => r.json()).then(data => { setQuiz(data); setLoading(false) })
    })
  }, [params])

  const handleStart = async () => {
    setStarting(true)
    const res = await fetch(`/api/quizzes/${quizId}/start`, { method: 'POST' })
    const data = await res.json()
    if (data.attemptId) router.push(`/play/${data.attemptId}`)
    else setStarting(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading quiz...</p>
      </div>
    </div>
  )

  if (!quiz) return <div className="p-8 text-gray-400">Quiz not found.</div>

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header Card */}
      <div className="card mb-6 text-center py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/5" />
        <div className="relative">
          <span className="badge bg-violet-500/20 text-violet-400 border border-violet-500/30 mb-4 inline-flex">
            {quiz.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{quiz.title}</h1>
          {quiz.description && <p className="text-gray-400 text-lg max-w-xl mx-auto">{quiz.description}</p>}
          <p className="text-gray-600 text-sm mt-3">Created by {quiz.creator?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: BookOpen, label: 'Questions', value: quiz.questions.length, color: 'text-blue-400' },
          { icon: Clock, label: 'Sec / Question', value: quiz.timePerQ, color: 'text-green-400' },
          { icon: Trophy, label: 'Max Points', value: quiz.totalPoints.toLocaleString(), color: 'text-amber-400' },
          { icon: Users, label: 'Attempts', value: quiz._count.attempts, color: 'text-violet-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center py-5">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="card mb-6">
        <h2 className="font-bold text-white mb-3">📋 How to Play</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>• Each question has a <strong className="text-white">{quiz.timePerQ}-second</strong> timer</li>
          <li>• Answer faster to earn a <strong className="text-white">speed bonus</strong> (up to 50% extra points)</li>
          <li>• Switching tabs will be <strong className="text-amber-400">flagged</strong> as suspicious activity</li>
          <li>• Your best score is saved to the leaderboard</li>
        </ul>
      </div>

      {/* Start Button */}
      <button onClick={handleStart} disabled={starting}
        className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3">
        <Play size={24} />
        {starting ? 'Starting...' : 'Start Quiz!'}
      </button>
    </div>
  )
}
