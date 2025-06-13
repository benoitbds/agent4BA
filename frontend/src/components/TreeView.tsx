import { useState } from 'react'
import { useRequirementsStore, type RequirementNode } from '../store/requirements'

function TreeNode({ node }: { node: RequirementNode }) {
  const [open, setOpen] = useState(false)
  const select = useRequirementsStore((s) => s.select)
  const selectedId = useRequirementsStore((s) => s.selectedId)
  const isSelected = selectedId === node.id
  return (
    <li>
      <div
        className={`flex items-center gap-1 cursor-pointer px-2 py-1 ${isSelected ? 'bg-indigo-100' : ''}`}
        onClick={() => select(node.id)}
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
            <TreeNode key={c.id} node={c} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function TreeView() {
  const tree = useRequirementsStore((s) => s.tree)
  return (
    <aside className="w-60 bg-white border-r h-[calc(100vh-4rem)] overflow-y-auto">
      <ul className="text-sm">
        {tree.map((n) => (
          <TreeNode key={n.id} node={n} />
        ))}
      </ul>
    </aside>
  )
}
