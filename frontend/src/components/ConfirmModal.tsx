import React from 'react'

interface Props {
  open: boolean
  title?: string
  message?: string
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmModal({ open, title, message, onCancel, onConfirm }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-4 max-w-sm w-full space-y-4">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {message && <p>{message}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 border rounded">
            Annuler
          </button>
          <button onClick={onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

