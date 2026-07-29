import Sidebar from '@/components/layout/Sidebar'

export default function QuizzesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 lg:overflow-auto">
        <div className="pt-14 lg:pt-0">{children}</div>
      </main>
    </div>
  )
}
