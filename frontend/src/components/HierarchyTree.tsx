import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import { useSpecStore, type SpecNode } from '../store/specSlice'

function TreeItem({ node }: { node: SpecNode }) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const select = useSpecStore((s) => s.select)
  const indent = useSpecStore((s) => s.indentNode)
  const outdent = useSpecStore((s) => s.outdentNode)
  const remove = useSpecStore((s) => s.deleteNode)
  const addSibling = useSpecStore((s) => s.createNode)
  const rename = useSpecStore((s) => s.rename)
  const selectedId = useSpecStore((s) => s.selectedId)
  const isSelected = selectedId === node.id

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSibling(node.level, node.parentId)
    } else if (e.key === 'F2') {
      e.preventDefault()
      setEditing(true)
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
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer rounded ${isSelected ? 'bg-indigo-100' : ''}`}
      >
        {node.children.length > 0 && (
          <span onClick={(e) => { e.stopPropagation(); setOpen(!open) }}>
            {open ? '▾' : '▸'}
          </span>
        )}
        {editing ? (
          <input
            autoFocus
            defaultValue={node.title}
            onBlur={(e) => { rename(node.id, e.target.value); setEditing(false) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                rename(node.id, (e.target as HTMLInputElement).value)
                setEditing(false)
              }
            }}
            className="border p-1 text-sm flex-1"
          />
        ) : (
          <span onDoubleClick={() => setEditing(true)}>{node.title}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); addSibling(node.level, node.parentId) }}
          className="ml-auto text-xs"
        >
          ＋
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setConfirm(true) }}
          className="text-xs text-red-600"
        >
          ✖
        </button>
      </div>
      {open && node.children.length > 0 && (
        <ul className="pl-4">
          {node.children.map((c) => (
            <TreeItem key={c.id} node={c} />
          ))}
        </ul>
      )}
      <ConfirmModal
        open={confirm}
        onCancel={() => setConfirm(false)}
        onConfirm={() => { remove(node.id); setConfirm(false) }}
        message="Supprimer ?"
      />
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
