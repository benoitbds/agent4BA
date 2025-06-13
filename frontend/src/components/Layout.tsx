import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between p-4">
        <span />
        <Link to="/projects" className="text-sm underline">
          Mes projets
        </Link>
      </header>
      <main className="max-w-3xl mx-auto py-8 flex flex-col gap-6 flex-1">
        {children}
      </main>
    </div>
  )
}
