'use client'
// src/components/certificates/CertificatePDF.tsx
import { useRef, useState } from 'react'
import { Download, Award, CheckCircle } from 'lucide-react'

interface CertificateCardProps {
  language: string
  userName: string
  earnedAt: string
}

export function CertificateCard({ language, userName, earnedAt }: CertificateCardProps) {
  const certRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const langColors: Record<string, { from: string; to: string; accent: string }> = {
    'C':            { from: '#1e3a5f', to: '#0f2440', accent: '#60a5fa' },
    'C++':          { from: '#1a2e4a', to: '#0d1f35', accent: '#38bdf8' },
    'Python':       { from: '#1a3a2a', to: '#0d2018', accent: '#4ade80' },
    'Java':         { from: '#3a1a1a', to: '#280f0f', accent: '#f97316' },
    'JavaScript':   { from: '#3a3210', to: '#28230a', accent: '#facc15' },
    'Spring Boot':  { from: '#1a3a1a', to: '#0d280d', accent: '#86efac' },
    'TypeScript':   { from: '#172554', to: '#08122c', accent: '#3b82f6' },
    'Go':           { from: '#083344', to: '#041d27', accent: '#0ea5e9' },
    'Rust':         { from: '#431407', to: '#250802', accent: '#fb923c' },
    'C#':           { from: '#311042', to: '#180722', accent: '#c084fc' },
    'PHP':          { from: '#2e3256', to: '#151830', accent: '#818cf8' },
  }
  const colors = langColors[language] ?? { from: '#2d1b69', to: '#1a0f3a', accent: '#a78bfa' }

  const handleDownload = async () => {
    if (!certRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`QuizDaw_Certificate_${language.replace(/\s+/g, '_')}_${userName.replace(/\s+/g, '_')}.pdf`)
    } finally {
      setDownloading(false)
    }
  }

  const date = new Date(earnedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-3">
      {/* Printable Certificate */}
      <div
        ref={certRef}
        style={{
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
          border: `2px solid ${colors.accent}40`,
          borderRadius: '16px',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* Corner decorations */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '80px', height: '80px', borderTop: `3px solid ${colors.accent}`, borderLeft: `3px solid ${colors.accent}`, borderRadius: '16px 0 0 0' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', borderTop: `3px solid ${colors.accent}`, borderRight: `3px solid ${colors.accent}`, borderRadius: '0 16px 0 0' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '80px', height: '80px', borderBottom: `3px solid ${colors.accent}`, borderLeft: `3px solid ${colors.accent}`, borderRadius: '0 0 0 16px' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: '80px', borderBottom: `3px solid ${colors.accent}`, borderRight: `3px solid ${colors.accent}`, borderRadius: '0 0 16px 0' }} />

        {/* Glow orb */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: `radial-gradient(circle, ${colors.accent}15, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ width: '64px', height: '64px', background: `${colors.accent}20`, border: `2px solid ${colors.accent}60`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: '28px' }}>🏆</span>
          </div>

          <p style={{ color: `${colors.accent}`, fontSize: '11px', letterSpacing: '4px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            Certificate of Achievement
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>This certifies that</p>
          <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            {userName}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
            has successfully passed all difficulty levels of
          </p>
          <div style={{ display: 'inline-block', background: `${colors.accent}20`, border: `1px solid ${colors.accent}40`, borderRadius: '8px', padding: '6px 20px', marginBottom: '16px' }}>
            <span style={{ color: colors.accent, fontSize: '20px', fontWeight: 800 }}>{language} Programming</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '12px' }}>
            Simple · Normal · Hard — Issued on {date}
          </p>

          {/* Footer */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${colors.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ color: colors.accent, fontSize: '16px', fontWeight: 900 }}>Quiz Daw</span>
            <span style={{ color: '#475569', fontSize: '11px' }}>— Interactive Quiz Platform</span>
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200"
        style={{
          background: `${colors.accent}20`,
          border: `1px solid ${colors.accent}40`,
          color: colors.accent,
        }}
      >
        {downloading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download size={16} />
            Download PDF Certificate
          </>
        )}
      </button>
    </div>
  )
}

/** Small badge for the results page */
export function CertificateBadge({ language }: { language: string }) {
  return (
    <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
      <Award size={20} className="flex-shrink-0" />
      <div>
        <p className="font-bold text-sm">🎉 Certificate Unlocked!</p>
        <p className="text-xs text-amber-300/80">You passed all 3 {language} levels. Visit My Certificates to download.</p>
      </div>
      <CheckCircle size={18} className="ml-auto flex-shrink-0" />
    </div>
  )
}
