'use client'
// src/app/certificates/page.tsx
import { useEffect, useState } from 'react'
import { Award, Frown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { CertificateCard } from '@/components/certificates/CertificatePDF'
import { BrandIcon } from '@/components/icons/BrandIcons'

interface Certificate {
  id: string
  language: string
  earnedAt: string
  downloadCount: number
}

export default function CertificatesPage() {
  const { data: session } = useSession()
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/certificates')
      .then(r => r.json())
      .then(data => { setCerts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Award className="text-amber-400 w-8 h-8" />
          <h1 className="text-3xl font-black text-white">My Certificates</h1>
        </div>
        <p className="text-gray-400">
          Pass all 3 difficulty levels (Simple → Normal → Hard) of a programming language to earn a certificate.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse" style={{ minHeight: '280px' }} />
          ))}
        </div>
      ) : certs.length === 0 ? (
        <div className="card text-center py-20">
          <Frown size={48} className="mx-auto text-gray-700 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No certificates yet</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Complete all 3 difficulty levels (Simple, Normal, Hard) for a programming language to earn your certificate!
          </p>
          <a href="/quizzes" className="btn-primary !py-3 !px-8 inline-flex items-center gap-2">
            Browse Programming Quizzes →
          </a>
        </div>
      ) : (
        <>
          <p className="text-green-400 font-semibold mb-6 flex items-center gap-2">
            <Award size={18} />
            {certs.length} certificate{certs.length > 1 ? 's' : ''} earned
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certs.map(cert => (
              <CertificateCard
                key={cert.id}
                language={cert.language}
                userName={session?.user?.name ?? 'Learner'}
                earnedAt={cert.earnedAt}
              />
            ))}
          </div>
        </>
      )}

      {/* Progress section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">Track Your Progress</h2>
        <ProgressTracker earnedLanguages={certs.map(c => c.language)} />
      </div>
    </div>
  )
}

const LANGUAGES = ['C', 'C++', 'Python', 'Java', 'JavaScript', 'Spring Boot', 'TypeScript', 'Go', 'Rust', 'C#', 'PHP']

function ProgressTracker({ earnedLanguages }: { earnedLanguages: string[] }) {
  const [progress, setProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    // Fetch passed levels per language
    const fetchProgress = async () => {
      const results: Record<string, number> = {}
      await Promise.all(
        LANGUAGES.map(async (lang) => {
          try {
            const r = await fetch('/api/certificates/check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ language: lang }),
            })
            const data = await r.json()
            if (data.passed) {
              results[lang] = data.passed.filter(Boolean).length
            } else if (data.eligible) {
              results[lang] = 3
            } else {
              results[lang] = 0
            }
          } catch {
            results[lang] = 0
          }
        })
      )
      setProgress(results)
    }
    fetchProgress()
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {LANGUAGES.map(lang => {
        const earned = earnedLanguages.includes(lang)
        const passed = progress[lang] ?? 0
        const pct = Math.round((passed / 3) * 100)
        return (
          <div key={lang} className={`card ${earned ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-400"><BrandIcon name={lang} className="w-6 h-6" /></span>
                <span className="font-semibold text-white text-sm">{lang}</span>
              </div>
              {earned && <Award size={18} className="text-amber-400" />}
            </div>
            <div className="flex gap-2 mb-3">
              {['Simple', 'Normal', 'Hard'].map((lvl, i) => (
                <div key={lvl} className={`flex-1 rounded-md h-2 transition-all duration-500 ${i < passed ? 'bg-violet-500' : 'bg-gray-700'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              {earned ? '✅ Certificate earned!' : `${passed}/3 levels passed`}
            </p>
          </div>
        )
      })}
    </div>
  )
}
