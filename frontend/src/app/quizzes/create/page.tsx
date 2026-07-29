'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CheckCircle, XCircle, Save, Eye, AlertTriangle } from 'lucide-react'

const CATEGORIES = ['Programming', 'Geography', 'Science', 'Math', 'History', 'General', 'Sports', 'Movies']

interface Option { text: string; isCorrect: boolean }
interface Question { text: string; type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'; points: number; timeLimit: number; explanation: string; options: Option[] }

const defaultMCQ = (): Question => ({
  text: '', type: 'MULTIPLE_CHOICE', points: 100, timeLimit: 20, explanation: '',
  options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
})
const defaultTF = (): Question => ({
  text: '', type: 'TRUE_FALSE', points: 100, timeLimit: 15, explanation: '',
  options: [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }],
})

export default function CreateQuizPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'DRAFT'>('DRAFT')
  const [timePerQ, setTimePerQ] = useState(20)
  const [questions, setQuestions] = useState<Question[]>([defaultMCQ()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeQ, setActiveQ] = useState(0)

  const addQuestion = (type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE') => {
    const q = type === 'MULTIPLE_CHOICE' ? defaultMCQ() : defaultTF()
    setQuestions(prev => [...prev, q])
    setActiveQ(questions.length)
  }

  const updateQuestion = useCallback((idx: number, field: keyof Question, value: Question[keyof Question]) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }, [])

  const updateOption = (qIdx: number, oIdx: number, field: keyof Option, value: string | boolean) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q
      return {
        ...q,
        options: q.options.map((o, j) => {
          if (j !== oIdx) return field === 'isCorrect' ? { ...o, isCorrect: false } : o
          return { ...o, [field]: value }
        }),
      }
    }))
  }

  const removeQuestion = (idx: number) => {
    if (questions.length === 1) return
    setQuestions(prev => prev.filter((_, i) => i !== idx))
    setActiveQ(Math.min(activeQ, questions.length - 2))
  }

  const handleSave = async (vis: 'PUBLIC' | 'DRAFT') => {
    if (!title.trim()) { setError('Quiz title is required'); return }
    if (questions.some(q => !q.text.trim())) { setError('All questions need text'); return }
    if (questions.some(q => q.options.every(o => !o.isCorrect))) { setError('Every question needs a correct answer'); return }
    setSaving(true); setError('')

    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, visibility: vis, timePerQ, questions }),
    })
    if (res.ok) {
      const data = await res.json()
      router.push(`/quizzes/${data.id}`)
    } else {
      const d = await res.json()
      setError(d.error || 'Failed to save quiz')
      setSaving(false)
    }
  }

  const q = questions[activeQ]

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Left: Question List */}
      <div className="w-64 flex-shrink-0 border-r border-gray-800 flex flex-col bg-gray-950">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-bold text-white text-sm">Questions</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {questions.map((q, i) => (
            <button key={i} onClick={() => setActiveQ(i)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                activeQ === i
                  ? 'bg-violet-600/20 border-violet-500/40 text-white'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Q{i + 1}</span>
                <span className="text-xs">{q.type === 'TRUE_FALSE' ? 'T/F' : 'MCQ'}</span>
              </div>
              <p className="text-xs mt-1 line-clamp-2">{q.text || 'No question text...'}</p>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-gray-800 space-y-2">
          <button onClick={() => addQuestion('MULTIPLE_CHOICE')}
            className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2">
            <Plus size={15} /> MCQ
          </button>
          <button onClick={() => addQuestion('TRUE_FALSE')}
            className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2">
            <Plus size={15} /> True/False
          </button>
        </div>
      </div>

      {/* Center: Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-2xl mx-auto">
          {/* Quiz Metadata */}
          <div className="card mb-6">
            <h2 className="font-bold text-white mb-4">Quiz Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-semibold">Title *</label>
                <input className="input" placeholder="My Awesome Quiz" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-semibold">Description</label>
                <textarea className="input resize-none" rows={2} placeholder="What's this quiz about?"
                  value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-semibold">Category</label>
                  <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-semibold">Time/Q (sec)</label>
                  <input type="number" className="input" min={5} max={120} value={timePerQ}
                    onChange={e => setTimePerQ(+e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-semibold">Visibility</label>
                  <select className="input" value={visibility} onChange={e => setVisibility(e.target.value as 'PUBLIC' | 'DRAFT')}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLIC">Public</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Question Editor */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Question {activeQ + 1}</h2>
              <button onClick={() => removeQuestion(activeQ)} disabled={questions.length === 1}
                className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30">
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-semibold">Question Text *</label>
                <textarea className="input resize-none" rows={3}
                  placeholder="Type your question here..."
                  value={q.text} onChange={e => updateQuestion(activeQ, 'text', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-semibold">Points</label>
                  <input type="number" className="input" min={10} max={1000} step={10}
                    value={q.points} onChange={e => updateQuestion(activeQ, 'points', +e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-semibold">Time Limit (sec)</label>
                  <input type="number" className="input" min={5} max={120}
                    value={q.timeLimit} onChange={e => updateQuestion(activeQ, 'timeLimit', +e.target.value)} />
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Answer Options</label>
                <div className="space-y-2">
                  {q.options.map((opt, j) => (
                    <div key={j} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      opt.isCorrect ? 'bg-green-500/10 border-green-500/40' : 'bg-gray-800/50 border-gray-700'
                    }`}>
                      <button onClick={() => updateOption(activeQ, j, 'isCorrect', true)}
                        className="flex-shrink-0 transition-transform hover:scale-110">
                        {opt.isCorrect
                          ? <CheckCircle size={22} className="text-green-400" />
                          : <XCircle size={22} className="text-gray-600 hover:text-gray-400" />}
                      </button>
                      {q.type === 'TRUE_FALSE' ? (
                        <span className="flex-1 font-semibold text-white">{opt.text}</span>
                      ) : (
                        <input className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-600 font-medium"
                          placeholder={`Option ${String.fromCharCode(65 + j)}...`}
                          value={opt.text} onChange={e => updateOption(activeQ, j, 'text', e.target.value)} />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">Click the circle to mark the correct answer</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-semibold">Explanation (optional)</label>
                <input className="input" placeholder="Shown to players after answering..."
                  value={q.explanation} onChange={e => updateQuestion(activeQ, 'explanation', e.target.value)} />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Save Buttons */}
          <div className="flex gap-3">
            <button onClick={() => handleSave('DRAFT')} disabled={saving}
              className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <Save size={17} /> Save Draft
            </button>
            <button onClick={() => handleSave('PUBLIC')} disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Eye size={17} /> {saving ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
