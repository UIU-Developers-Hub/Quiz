'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Volume2, VolumeX, Check, X, CheckCircle2, XCircle, AlarmClock } from 'lucide-react'
interface Option { id: string; text: string; order: number }
interface Question {
  id: string; text: string; type: string; points: number; timeLimit: number; order: number
  options: Option[]
}
interface Quiz { title: string; questions: Question[] }
interface Attempt { id: string; quiz: Quiz; answers: { questionId: string }[] }

const OPTION_STYLES = [
  { bg: 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30', active: 'bg-red-500 border-red-400', letter: 'A', color: 'text-red-400' },
  { bg: 'bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30', active: 'bg-blue-500 border-blue-400', letter: 'B', color: 'text-blue-400' },
  { bg: 'bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30', active: 'bg-amber-500 border-amber-400', letter: 'C', color: 'text-amber-400' },
  { bg: 'bg-green-500/20 border-green-500/40 hover:bg-green-500/30', active: 'bg-green-500 border-green-400', letter: 'D', color: 'text-green-400' },
]

export default function PlayPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const router = useRouter()
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number; correctOptionId: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabWarnings, setTabWarnings] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [attemptId, setAttemptId] = useState('')
  const startTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    params.then(({ attemptId: id }) => {
      setAttemptId(id)
      fetch(`/api/attempts/${id}`)
        .then(r => r.json())
        .then(data => { setAttempt(data); setLoading(false) })
    })
  }, [params])

  // Sync timer when question changes
  const currentQ = attempt?.quiz.questions[currentIdx]
  useEffect(() => {
    if (!currentQ) return
    setTimeLeft(currentQ.timeLimit)
    setSelected(null)
    setResult(null)
    startTimeRef.current = Date.now()
  }, [currentIdx, currentQ?.id])

  // Countdown timer
  useEffect(() => {
    if (!currentQ || selected !== null) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleAnswer(null) // time up — submit null
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [currentIdx, selected, currentQ?.id])

  // Anti-cheat: tab switch detection
  useEffect(() => {
    if (!attemptId) return
    const handler = () => {
      if (document.visibilityState === 'hidden') {
        setTabWarnings(w => w + 1)
        fetch(`/api/attempts/${attemptId}/anticheat`, { method: 'POST' })
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [attemptId])

  const handleAnswer = useCallback(async (optionId: string | null) => {
    if (!currentQ || selected !== null) return
    if (timerRef.current) clearInterval(timerRef.current)

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
    setSelected(optionId || '')

    const res = await fetch(`/api/attempts/${attemptId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: currentQ.id, optionId, timeSpent }),
    })
    const data = await res.json()
    setResult(data)

    // Move to next after delay
    setTimeout(() => {
      const nextIdx = currentIdx + 1
      if (nextIdx < (attempt?.quiz.questions.length || 0)) {
        setCurrentIdx(nextIdx)
      } else {
        router.push(`/results/${attemptId}`)
      }
    }, 1800)
  }, [currentQ, selected, attemptId, currentIdx, attempt, router])

  if (loading || !attempt) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading quiz...</p>
      </div>
    </div>
  )

  const questions = attempt.quiz.questions
  const progress = ((currentIdx) / questions.length) * 100
  const timerPct = currentQ ? (timeLeft / currentQ.timeLimit) * 100 : 100
  const timerColor = timerPct > 50 ? '#22c55e' : timerPct > 25 ? '#f59e0b' : '#ef4444'

  // Timer ring
  const radius = 36
  const circ = 2 * Math.PI * radius
  const dashOffset = circ - (timerPct / 100) * circ

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-gray-400 whitespace-nowrap">Q {currentIdx + 1}/{questions.length}</span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {tabWarnings > 0 && (
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                <AlertTriangle size={13} />
                {tabWarnings} warning{tabWarnings > 1 ? 's' : ''}
              </div>
            )}
            <button onClick={() => setSoundOn(!soundOn)} className="text-gray-500 hover:text-gray-300 transition-colors">
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      {currentQ && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-3xl fade-in-up">
            {/* Timer + Points */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">POINTS</p>
                <p className="text-2xl font-black text-amber-400">{currentQ.points}</p>
              </div>

              {/* SVG countdown ring */}
              <div className="relative w-20 h-20">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle cx="40" cy="40" r={radius} fill="none"
                    stroke={timerColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={dashOffset}
                    className="progress-ring-circle"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: timerColor }}>{timeLeft}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">QUESTION</p>
                <p className="text-2xl font-black text-violet-400">{currentIdx + 1}</p>
              </div>
            </div>

            {/* Question Text */}
            <div className="card mb-6 text-center py-8">
              <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">{currentQ.text}</p>
            </div>

            {/* Answer Options */}
            <div className={`grid gap-3 ${currentQ.type === 'TRUE_FALSE' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
              {currentQ.options.sort((a, b) => a.order - b.order).map((option, i) => {
                const style = OPTION_STYLES[i % OPTION_STYLES.length]
                const isSelected = selected === option.id
                const isCorrect = result?.correctOptionId === option.id
                const isWrong = isSelected && result && !result.isCorrect

                let blockClass = `answer-block p-5 border-2 ${style.bg} text-left`
                if (result) {
                  if (isCorrect) blockClass = `answer-block p-5 border-2 bg-green-500/30 border-green-400 animate-correct`
                  else if (isWrong) blockClass = `answer-block p-5 border-2 bg-red-500/30 border-red-400 animate-wrong`
                  else blockClass = `answer-block p-5 border-2 bg-gray-800/50 border-gray-700 opacity-50 cursor-default`
                }

                return (
                  <button key={option.id} onClick={() => handleAnswer(option.id)}
                    disabled={!!selected} className={blockClass}>
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-black ${style.color} w-8 flex-shrink-0`}>{style.letter}</span>
                      <span className="font-semibold text-white text-lg">{option.text}</span>
                      {result && isCorrect && <Check className="ml-auto text-green-400 w-6 h-6" />}
                      {result && isWrong && <X className="ml-auto text-red-400 w-6 h-6" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Result Feedback */}
            {result && (
              <div className={`mt-4 p-4 rounded-2xl text-center font-bold text-lg fade-in-up flex items-center justify-center gap-2 ${
                result.isCorrect
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {result.isCorrect
                  ? <><CheckCircle2 className="w-5 h-5" /> Correct! +{result.pointsEarned} points</>
                  : <><XCircle className="w-5 h-5" /> Wrong! The correct answer is highlighted</>
                }
              </div>
            )}

            {/* Time up */}
            {timeLeft === 0 && !result && (
              <div className="mt-4 p-4 rounded-2xl text-center font-bold bg-gray-800/50 border border-gray-700 text-gray-400 flex items-center justify-center gap-2">
                <AlarmClock className="w-5 h-5" /> Time&apos;s up!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
