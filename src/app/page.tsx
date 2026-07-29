// src/app/page.tsx — Beautiful public landing page
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Brain, Zap, Target, Trophy, ShieldCheck, Palette, BarChart3 } from 'lucide-react'

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  // Fetch real stats
  const [quizCount, userCount, attemptCount] = await Promise.all([
    prisma.quiz.count({ where: { visibility: 'PUBLIC' } }),
    prisma.user.count(),
    prisma.attempt.count({ where: { status: 'COMPLETED' } }),
  ])

  const features = [
    {
      icon: <Zap className="text-amber-400 w-10 h-10 mb-4" />,
      title: 'Speed-Based Scoring',
      desc: 'Answer faster to earn bonus points — up to 50% extra. Every second counts!',
    },
    {
      icon: <Target className="text-red-400 w-10 h-10 mb-4" />,
      title: 'Instant Feedback',
      desc: 'See correct/wrong answers highlighted in real-time with smooth animations.',
    },
    {
      icon: <Trophy className="text-yellow-400 w-10 h-10 mb-4" />,
      title: 'Live Leaderboards',
      desc: 'Compete globally or per-quiz. Track your rank and beat your personal best.',
    },
    {
      icon: <ShieldCheck className="text-blue-400 w-10 h-10 mb-4" />,
      title: 'Anti-Cheat System',
      desc: 'Tab-switching is detected and flagged automatically to keep scores fair.',
    },
    {
      icon: <Palette className="text-pink-400 w-10 h-10 mb-4" />,
      title: 'Quiz Creation Engine',
      desc: 'Build beautiful quizzes with MCQ and True/False in minutes. Publish to the world.',
    },
    {
      icon: <BarChart3 className="text-green-400 w-10 h-10 mb-4" />,
      title: 'Deep Analytics',
      desc: 'See per-question accuracy, common wrong answers, and top performers.',
    },
  ]

  return (
    <div className="min-h-screen gradient-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Brain className="w-8 h-8 text-violet-400" />
            <span className="text-xl font-black text-violet-400 glow-text">Quiz Daw</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary !py-2 !px-5 !text-sm !bg-transparent hover:!bg-gray-800">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary !py-2 !px-5 !text-sm">
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-28 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            World-Class Quiz Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Test Your Knowledge,<br />
            <span className="text-transparent bg-clip-text" style={{backgroundImage:'linear-gradient(to right, #a78bfa, #818cf8)'}}>
              Beat the Clock
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Quiz Daw is an interactive quiz platform with speed-based scoring, real-time leaderboards, and a built-in quiz creation engine. Play, compete, and learn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="btn-primary !py-4 !px-8 !text-lg w-full sm:w-auto">
              🚀 Start Playing Free
            </Link>
            <Link href="/login" className="btn-secondary !py-4 !px-8 !text-lg w-full sm:w-auto !bg-transparent hover:!bg-gray-800">
              Sign In →
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 md:gap-16 text-center">
            {[
              { value: quizCount, label: 'Public Quizzes' },
              { value: userCount, label: 'Players' },
              { value: attemptCount, label: 'Games Played' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl md:text-4xl font-black text-white">{value.toLocaleString()}</p>
                <p className="text-gray-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Everything You Need</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            A complete quiz experience from creation to competition.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-200 group">
              {icon}
              <h3 className="font-bold text-white text-lg mb-2 group-hover:text-violet-400 transition-colors">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-24 text-center">
        <div className="card py-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/5" />
          <div className="relative">
            <Brain className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-3">Ready to Play?</h2>
            <p className="text-gray-400 mb-8">Join thousands of players and test your knowledge today.</p>
            <Link href="/register" className="btn-primary !py-4 !px-10 !text-lg">
              Create Free Account →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-gray-400" />
            <span className="font-black text-gray-400">Quiz Daw</span>
          </div>
          <p className="text-gray-600 text-sm">Built with Next.js · SQLite · Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}
