import type { ReactNode } from 'react'

interface Props {
  open: boolean
  title?: string
  onClose?: () => void
  children?: ReactNode
}

export default function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-4 max-w-sm w-full space-y-4">
        <div className="flex justify-between items-center">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {onClose && (
            <button onClick={onClose} className="text-gray-500 text-xl">×</button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
