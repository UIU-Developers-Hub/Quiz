'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { BookOpen, LayoutDashboard, Trophy, PlusCircle, Shield, LogOut, Menu, X, ClipboardList, User, Brain, Award } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/quizzes', label: 'Browse Quizzes', icon: BookOpen },
  { href: '/certificates', label: 'My Certificates', icon: Award },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'My Profile', icon: User },
]

const creatorLinks = [
  { href: '/my-quizzes', label: 'My Quizzes', icon: ClipboardList },
  { href: '/quizzes/create', label: 'Create Quiz', icon: PlusCircle },
]

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const role = session?.user?.role
  const isAdmin = role === 'ADMIN'
  const isCreator = role === 'CREATOR' || isAdmin

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Brain className="w-8 h-8 text-violet-400" />
          <span className="text-xl font-black text-violet-400 glow-text">Quiz Daw</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                active
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          )
        })}

        {isCreator && (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Creator</p>
            </div>
            {creatorLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    active
                      ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  }`}>
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
          </>
        )}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Admin</p>
            </div>
            <Link href="/admin"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                pathname === '/admin'
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}>
              <Shield size={18} />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{session?.user?.name}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isAdmin ? 'bg-amber-500/20 text-amber-400' :
              isCreator ? 'bg-violet-500/20 text-violet-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {role}
            </span>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-500/10">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-violet-400" />
          <span className="font-black text-violet-400">Quiz Daw</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="p-2 text-gray-400">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)}>
          <div className="w-72 h-full bg-gray-950 border-r border-gray-800" onClick={e => e.stopPropagation()}>
            {SidebarContent()}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 h-screen sticky top-0 flex-col bg-gray-950 border-r border-gray-800">
        {SidebarContent()}
      </div>
    </>
  )
}
