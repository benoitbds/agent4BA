import { useState } from 'react'
import { useRequirementsStore, type RequirementNode } from '../store/requirements'
import Modal from './Modal'
import NodeForm from './forms/NodeForm'

function TreeNode({ node }: { node: RequirementNode }) {
  const [open, setOpen] = useState(false)
  const select = useRequirementsStore((s) => s.select)
  const selectedId = useRequirementsStore((s) => s.selectedId)
  const isSelected = selectedId === node.id
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  return (
    <li>
      <div
        className={`flex items-center gap-1 cursor-pointer px-2 py-1 ${isSelected ? 'bg-indigo-100' : ''}`}
        onClick={() => select(node.id)}
      >
        {hasChildren && (
          <span onClick={(e) => { e.stopPropagation(); setOpen(!open) }}>
            {open ? '▾' : '▸'}
          </span>
        )}
        <span>{node.title}</span>
      </div>
      {open && hasChildren && (
        <ul className="pl-4">
          {node.children?.map((c) => (
            <TreeNode key={c.id} node={c} />
          ))}
        </ul>
      )}
    </li>
  )
}

interface Props {
  projectId: number
}

export default function TreeView(props: Props) {
  const { projectId } = props
  const tree = useRequirementsStore((s) => s.tree)
  const loading = useRequirementsStore((s) => s.loading)
  const createRoot = useRequirementsStore((s) => s.createRootRequirement)

  const [open, setOpen] = useState(false)

  const save = async (values: { title: string; description: string }) => {
    await createRoot(projectId, values)
    setOpen(false)
  }

  return (
    <aside className="w-60 bg-white border-r h-[calc(100vh-4rem)] overflow-y-auto flex flex-col">
      <div className="flex justify-between items-center p-2">
        <span />
        <button
          onClick={() => setOpen(true)}
          disabled={loading}
          className="text-sm text-indigo-600 hover:underline disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <span className="spinner-border animate-spin h-4 w-4" />
          ) : (
            '＋ Requirement'
          )}
        </button>
      </div>
      <ul className="text-sm flex-1">
        {tree.map((n) => (
          <TreeNode key={n.id} node={n} />
        ))}
      </ul>
      <Modal open={open} title="Nouveau requirement" onClose={() => setOpen(false)}>
        <NodeForm onSave={save} onCancel={() => setOpen(false)} />
      </Modal>
    </aside>
  )
}
