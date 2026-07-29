import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import { BookOpen, Plus, Eye, EyeOff, Play, Trash2, Edit, FileText, Globe, ClipboardList } from 'lucide-react'

export default async function MyQuizzesPage() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!['CREATOR', 'ADMIN'].includes(role)) redirect('/dashboard')

  const quizzes = await prisma.quiz.findMany({
    where: { creatorId: session!.user!.id as string },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 pt-14 lg:pt-0 overflow-auto">
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-white">My Quizzes</h1>
              <p className="text-gray-400 mt-1">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} created</p>
            </div>
            <Link href="/quizzes/create" className="btn-primary flex items-center gap-2">
              <Plus size={18} /> New Quiz
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-24">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h2 className="text-xl font-bold text-white mb-2">No quizzes yet</h2>
              <p className="text-gray-400 mb-6">Create your first quiz to get started!</p>
              <Link href="/quizzes/create" className="btn-primary inline-flex items-center gap-2">
                <Plus size={18} /> Create a Quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="card hover:border-gray-700 transition-all duration-200 group">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 p-3 rounded-xl border ${
                      quiz.visibility === 'PUBLIC'
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-gray-700/30 border-gray-700'
                    }`}>
                      {quiz.visibility === 'PUBLIC'
                        ? <Eye size={20} className="text-green-400" />
                        : <EyeOff size={20} className="text-gray-500" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-bold text-white group-hover:text-violet-400 transition-colors truncate">
                          {quiz.title}
                        </h2>
                        <span className={`badge text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                          quiz.visibility === 'PUBLIC'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {quiz.visibility === 'PUBLIC' ? <span className="flex items-center gap-1"><Globe size={12} /> Public</span> : <span className="flex items-center gap-1"><ClipboardList size={12} /> Draft</span>}
                        </span>
                        <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs flex-shrink-0">
                          {quiz.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen size={13} /> {quiz._count.questions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Play size={13} /> {quiz._count.attempts} plays
                        </span>
                        <span>
                          Created {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/quizzes/${quiz.id}`}
                        className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium transition-colors">
                        Preview
                      </Link>
                      <Link href={`/quizzes/${quiz.id}/analytics`}
                        className="px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-sm font-medium transition-colors border border-violet-500/20">
                        Analytics
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
