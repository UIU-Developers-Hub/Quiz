'use client'
// src/app/results/[attemptId]/ResultsClientExtras.tsx
import { useEffect, useState } from 'react'
import { CertificateBadge } from '@/components/certificates/CertificatePDF'

interface Props { language: string }

export default function ResultsClientExtras({ language }: Props) {
  const [status, setStatus] = useState<'loading' | 'new' | 'existing' | 'not_eligible'>('loading')

  useEffect(() => {
    fetch('/api/certificates/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.eligible) setStatus('not_eligible')
        else if (data.alreadyHad) setStatus('existing')
        else setStatus('new')
      })
      .catch(() => setStatus('not_eligible'))
  }, [language])

  if (status === 'loading') return (
    <div className="card mb-6 animate-pulse" style={{ height: '64px' }} />
  )

  if (status === 'not_eligible') return null

  return (
    <div className="mb-6 animate-bounce-in">
      {status === 'new' ? (
        <CertificateBadge language={language} />
      ) : (
        <div className="flex items-center gap-2 text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 text-sm">
          🏆 You already have the <strong>{language}</strong> certificate. Visit <a href="/certificates" className="underline">My Certificates</a> to download it.
        </div>
      )}
    </div>
  )
}
