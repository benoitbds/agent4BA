import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <div className="max-w-3xl mx-auto py-8 flex flex-col gap-6">{children}</div>
  )
}
