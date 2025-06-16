import { useState } from 'react'
import { useSpecStore, type SpecNode } from '../store/specSlice'

function TreeItem({ node }: { node: SpecNode }) {
  const [open, setOpen] = useState(true)
  const select = useSpecStore((s) => s.select)
  const indent = useSpecStore((s) => s.indentNode)
  const outdent = useSpecStore((s) => s.outdentNode)
  const selectedId = useSpecStore((s) => s.selectedId)
  const isSelected = selectedId === node.id

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      select(node.id)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setOpen((o) => !o)
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      indent(node.id)
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      outdent(node.id)
    }
  }

  return (
    <li>
      <div
        tabIndex={0}
        onKeyDown={handleKey}
        onClick={() => select(node.id)}
        className={`flex gap-1 px-2 py-1 cursor-pointer rounded ${isSelected ? 'bg-indigo-100' : ''}`}
      >
        {node.children.length > 0 && (
          <span onClick={(e) => { e.stopPropagation(); setOpen(!open) }}>
            {open ? '▾' : '▸'}
          </span>
        )}
        <span>{node.title}</span>
      </div>
      {open && node.children.length > 0 && (
        <ul className="pl-4">
          {node.children.map((c) => (
            <TreeItem key={c.id} node={c} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function HierarchyTree() {
  const nodes = useSpecStore((s) => s.nodes)
  return (
    <aside className="w-64 border-r overflow-y-auto p-2 h-full">
      <ul>
        {nodes.map((n) => (
          <TreeItem key={n.id} node={n} />
        ))}
      </ul>
    </aside>
  )
}
