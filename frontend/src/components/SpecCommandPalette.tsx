import { useEffect, useState } from 'react'
import { useSpecStore, type SpecNode, type SpecLevel } from '../store/specSlice'

interface PaletteItem {
  id: string
  label: string
  action: () => void
}

function flatten(nodes: SpecNode[]): SpecNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children)])
}

export default function SpecCommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const nodes = useSpecStore((s) => s.nodes)
  const select = useSpecStore((s) => s.select)
  const createNode = useSpecStore((s) => s.createNode)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const quickLevels: SpecLevel[] = ['requirement', 'epic', 'feature', 'story']

  const items: PaletteItem[] = [
    ...quickLevels.map((level) => ({
      id: `create-${level}`,
      label: `Create ${level}`,
      action: () => createNode(level)
    })),
    ...flatten(nodes).map((n) => ({
      id: n.id,
      label: n.title,
      action: () => select(n.id)
    }))
  ]

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4">
      <div className="bg-white rounded w-full max-w-md p-2 space-y-2">
        <input
          autoFocus
          className="w-full border p-2"
          placeholder="Type a command or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul>
          {filtered.map((i) => (
            <li key={i.id}>
              <button
                className="w-full text-left px-2 py-1 hover:bg-indigo-50 rounded"
                onClick={() => {
                  i.action()
                  setOpen(false)
                }}
              >
                {i.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
