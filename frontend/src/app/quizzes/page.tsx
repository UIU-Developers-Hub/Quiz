'use client'
// src/app/quizzes/page.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, BookOpen, Clock, Users, Award, ChevronRight, Zap, Flame, Shield } from 'lucide-react'

const CATEGORIES = ['All', 'Programming', 'Geography', 'Science', 'Math', 'History', 'General']
const PROG_LANGUAGES = ['C', 'C++', 'Python', 'Java', 'JavaScript', 'Spring Boot', 'TypeScript', 'Go', 'Rust', 'C#', 'PHP']
const LEVELS = ['SIMPLE', 'NORMAL', 'HARD'] as const
type Level = typeof LEVELS[number]

const LEVEL_META: Record<Level, { label: string; color: string; bg: string }> = {
  SIMPLE: { label: 'Simple', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  NORMAL: { label: 'Normal', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  HARD:   { label: 'Hard',   color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/30' },
}

import { BrandIcon } from '@/components/icons/BrandIcons'

interface Quiz {
  id: string; title: string; description: string; category: string
  language?: string | null; level?: Level | null
  timePerQ: number; playCount: number; totalPoints: number; passPercent?: number
  creator: { name: string }
  _count: { questions: number; attempts: number }
}

export default function QuizzesPage() {
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState<Level>('SIMPLE')

  useEffect(() => {
    setLoading(true)
    const url = category !== 'All' ? `/api/quizzes?category=${category}` : '/api/quizzes'
    fetch(url).then(r => r.json()).then(data => { setAllQuizzes(data); setLoading(false) })
  }, [category])

  const filtered = allQuizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.description?.toLowerCase().includes(search.toLowerCase())
  )

  const popularLangQuizzes = allQuizzes.filter(q => q.language && PROG_LANGUAGES.includes(q.language) && q.level)

  const byLang: Record<string, Record<Level, Quiz | null>> = {}
  for (const lang of PROG_LANGUAGES) {
    byLang[lang] = { SIMPLE: null, NORMAL: null, HARD: null }
    for (const lv of LEVELS) {
      byLang[lang][lv] = popularLangQuizzes.find(q => q.language === lang && q.level === lv) ?? null
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Browse Quizzes</h1>
        <p className="text-gray-400">Find your next challenge</p>
      </div>

      {/* Popular Programming Quizzes */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Award className="text-amber-400" size={22} />
              Popular Programming Quizzes
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Pass all 3 levels of a language to earn a certificate</p>
          </div>
          <Link href="/certificates" className="flex items-center gap-1 text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 px-4 py-2 rounded-xl border border-violet-500/20">
            My Certificates <ChevronRight size={16} />
          </Link>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          {LEVELS.map(lv => {
            const m = LEVEL_META[lv]
            return (
              <button key={lv} onClick={() => setSelectedLevel(lv)}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  selectedLevel === lv ? `${m.bg} ${m.color}` : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                }`}>
                {lv === 'SIMPLE' ? <Zap size={14}/> : lv === 'NORMAL' ? <Flame size={14}/> : <Shield size={14}/>}
                {m.label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROG_LANGUAGES.map(lang => {
            const quiz = byLang[lang]?.[selectedLevel]
            const m = LEVEL_META[selectedLevel]
            if (!quiz) return (
              <div key={lang} className="card opacity-40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400"><BrandIcon name={lang} className="w-8 h-8" /></span>
                  <span className="font-bold text-white text-lg">{lang}</span>
                </div>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            )
            return (
              <div key={lang} className={`card flex flex-col hover:border-violet-500/40 transition-all duration-200 hover:-translate-y-1 group border ${m.bg}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 drop-shadow-md"><BrandIcon name={lang} className="w-8 h-8" /></span>
                    <div>
                      <p className="font-bold text-white text-lg">{lang}</p>
                      <span className={`text-xs font-bold uppercase tracking-wider ${m.color}`}>{m.label} Level</span>
                    </div>
                  </div>
                  <span className="badge bg-gray-800 text-gray-400 text-xs">{quiz.playCount} plays</span>
                </div>
                <p className="text-sm text-gray-400 mb-4 flex-1 line-clamp-2">{quiz.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pt-3 border-t border-gray-800/50">
                  <span className="flex items-center gap-1.5"><BookOpen size={14}/> {quiz._count.questions} Qs</span>
                  <span className="flex items-center gap-1.5"><Clock size={14}/> {quiz.timePerQ}s/Q</span>
                  <span className="flex items-center gap-1.5"><Users size={14}/> {quiz._count.attempts}</span>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-gray-500">Pass: <span className="text-white">{quiz.passPercent ?? 60}%</span></span>
                  <Link href={`/quizzes/${quiz.id}`} className="btn-primary !py-2 !px-5 !text-sm">Play →</Link>
                </div>
                
                {/* Level progress dots */}
                <div className="flex gap-1.5 mt-4">
                  {LEVELS.map(lv => (
                    <div key={lv} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${lv === selectedLevel ? (lv==='SIMPLE'?'bg-green-500':lv==='NORMAL'?'bg-amber-500':'bg-red-500') : 'bg-gray-800/80'}`} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* All Quizzes */}
      <div>
        <h2 className="text-xl font-black text-white mb-4">All Quizzes</h2>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="input pl-10" placeholder="Search general quizzes..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  category === cat ? 'bg-violet-600 border-violet-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-gray-800 rounded mb-3 w-1/3" />
                <div className="h-6 bg-gray-800 rounded mb-3" />
                <div className="h-4 bg-gray-800 rounded mb-5 w-3/4" />
                <div className="h-10 bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-20">
            <BookOpen size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-400 text-lg">No quizzes found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(quiz => (
              <div key={quiz.id} className="card flex flex-col hover:border-violet-500/40 transition-all duration-200 hover:-translate-y-1 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold uppercase tracking-wider">{quiz.category}</span>
                    {quiz.level && <span className={`badge text-xs font-bold uppercase tracking-wider border ${LEVEL_META[quiz.level]?.bg} ${LEVEL_META[quiz.level]?.color}`}>{LEVEL_META[quiz.level]?.label}</span>}
                  </div>
                  <span className="badge bg-gray-800 text-gray-400 text-xs">{quiz.playCount} plays</span>
                </div>
                <h3 className="font-bold text-xl text-white mb-2 group-hover:text-violet-400 transition-colors line-clamp-2">{quiz.title}</h3>
                {quiz.description && <p className="text-gray-400 text-sm mb-5 line-clamp-2 flex-1">{quiz.description}</p>}
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pt-3 border-t border-gray-800/50">
                  <span className="flex items-center gap-1.5"><BookOpen size={14}/> {quiz._count.questions} Qs</span>
                  <span className="flex items-center gap-1.5"><Clock size={14}/> {quiz.timePerQ}s/Q</span>
                  <span className="flex items-center gap-1.5"><Users size={14}/> {quiz._count.attempts}</span>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-500">by <span className="text-gray-300">{quiz.creator?.name}</span></span>
                  <Link href={`/quizzes/${quiz.id}`} className="btn-primary !py-2 !px-5 !text-sm">Play →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
