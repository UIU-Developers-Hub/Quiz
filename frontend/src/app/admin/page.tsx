import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import { Users, BookOpen, Play, Trophy, Shield, Trash2 } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'ADMIN') redirect('/dashboard')

  const [userCount, quizCount, attemptCount, users, recentQuizzes] = await Promise.all([
    prisma.user.count(),
    prisma.quiz.count(),
    prisma.attempt.count(),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { attempts: true } } } }),
    prisma.quiz.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { creator: { select: { name: true } }, _count: { select: { questions: true, attempts: true } } } }),
  ])

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 pt-14 lg:pt-0 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Shield size={24} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Admin Panel</h1>
              <p className="text-gray-400">Platform overview and management</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Users, label: 'Total Users', value: userCount, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { icon: BookOpen, label: 'Total Quizzes', value: quizCount, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
              { icon: Play, label: 'Total Attempts', value: attemptCount, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`card border ${bg} flex items-center gap-4`}>
                <div className={`p-3 rounded-xl ${bg}`}><Icon size={22} className={color} /></div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{label}</p>
                  <p className={`text-3xl font-black ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users Table */}
            <div className="card">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Users size={18} className="text-blue-400" /> All Users</h2>
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-violet-600/50 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge text-xs px-2 py-0.5 rounded-full font-bold ${
                        user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' :
                        user.role === 'CREATOR' ? 'bg-violet-500/20 text-violet-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{user.role}</span>
                      <span className="text-xs text-gray-600">{user._count.attempts} plays</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Quizzes Table */}
            <div className="card">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2"><BookOpen size={18} className="text-violet-400" /> Recent Quizzes</h2>
              <div className="space-y-2">
                {recentQuizzes.map(quiz => (
                  <div key={quiz.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm truncate group-hover:text-violet-400 transition-colors">{quiz.title}</p>
                        <span className={`badge text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                          quiz.visibility === 'PUBLIC' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>{quiz.visibility}</span>
                      </div>
                      <p className="text-xs text-gray-500">by {quiz.creator.name} · {quiz._count.questions} Qs · {quiz._count.attempts} plays</p>
                    </div>
                    <Link href={`/quizzes/${quiz.id}`} className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex-shrink-0">View →</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
