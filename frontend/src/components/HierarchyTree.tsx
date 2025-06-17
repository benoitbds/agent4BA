import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ConfirmModal from './ConfirmModal'
import Modal from './Modal'
import NodeForm from './forms/NodeForm'
import { useSpecStore } from '../store/specSlice'
import type { SpecNode, SpecLevel } from '@/types/SpecNode'

function getParentId(n: SpecNode): number | null {
  return (
    n.parent_story_id ?? n.parent_feature_id ?? n.parent_epic_id ?? n.parent_req_id ?? null
  )
}

const levelOrder: SpecLevel[] = ['requirement', 'epic', 'feature', 'story', 'usecase']

function getChildLevel(level: SpecLevel): SpecLevel | null {
  const idx = levelOrder.indexOf(level)
  return levelOrder[idx + 1] ?? null
}

interface TreeItemProps {
  node: SpecNode
  editable: boolean
}

function buildChildData(parent: SpecNode): Omit<SpecNode, 'id' | 'project_id'> {
  const childLevel = getChildLevel(parent.level)
  if (!childLevel) {
    throw new Error('No child level')
  }
  return {
    title: 'New',
    level: childLevel,
    parent_req_id: childLevel === 'epic' ? parent.id : parent.parent_req_id,
    parent_epic_id:
      childLevel === 'feature'
        ? parent.id
        : childLevel === 'epic'
        ? undefined
        : parent.parent_epic_id,
    parent_feature_id:
      childLevel === 'story'
        ? parent.id
        : childLevel === 'usecase'
        ? parent.parent_feature_id
        : undefined,
    parent_story_id: childLevel === 'usecase' ? parent.id : undefined,
  }
}

interface AddModalProps {
  open: boolean
  title: string
  onSave: (values: { title: string; description: string }) => void
  onCancel: () => void
}

function AddModal({ open, title, onSave, onCancel }: AddModalProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <NodeForm onSave={onSave} onCancel={onCancel} />
    </Modal>
  )
}

function TreeItem({ node, editable }: TreeItemProps) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const nodes = useSpecStore((s) => s.nodes)
  const create = useSpecStore((s) => s.create)
  const update = useSpecStore((s) => s.update)
  const remove = useSpecStore((s) => s.remove)

  const children = nodes.filter((n) => getParentId(n) === node.id)

  return (
    <li>
      <div className="flex items-center gap-1 px-2 py-1">
        {children.length > 0 && (
          <span onClick={() => setOpen(!open)}>{open ? '▾' : '▸'}</span>
        )}
        {editing ? (
          <input
            autoFocus
            defaultValue={node.title}
            onBlur={(e) => {
              update(node.project_id, { ...node, title: e.target.value })
              setEditing(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                update(node.project_id, { ...node, title: (e.target as HTMLInputElement).value })
                setEditing(false)
              }
            }}
            className="border p-1 text-sm flex-1"
          />
        ) : (
          <span onDoubleClick={() => editable && setEditing(true)}>{node.title}</span>
        )}
        {editable && getChildLevel(node.level) && (
          <button onClick={() => setAddOpen(true)} className="ml-auto text-xs">
            ＋
          </button>
        )}
        {editable && (
          <button onClick={() => setConfirm(true)} className="text-xs text-red-600">
            ✖
          </button>
        )}
      </div>
      {open && children.length > 0 && (
        <ul className="pl-4">
          {children.map((c) => (
            <TreeItem key={c.id} node={c} editable={editable} />
          ))}
        </ul>
      )}
      {editable && (
        <ConfirmModal
          open={confirm}
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            remove(node.project_id, node)
            setConfirm(false)
          }}
          message="Supprimer ?"
        />
      )}
      {editable && getChildLevel(node.level) && (
        <AddModal
          open={addOpen}
          title={`Ajouter ${getChildLevel(node.level)}`}
          onCancel={() => setAddOpen(false)}
          onSave={(vals) => {
            create(node.project_id, { ...buildChildData(node), ...vals })
            setAddOpen(false)
          }}
        />
      )}
    </li>
  )
}

interface TreeProps {
  editable?: boolean
  projectId?: number
}

export default function HierarchyTree({ editable = false, projectId }: TreeProps) {
  const nodes = useSpecStore((s) => s.nodes)
  const create = useSpecStore((s) => s.create)
  const { id } = useParams<{ id?: string }>()
  const pid = projectId ?? Number(id)
  const [rootOpen, setRootOpen] = useState(false)

  const addRequirement = ({ title, description }: { title: string; description: string }) => {
    if (!pid) return
    create(pid, { title, description, level: 'requirement' })
  }

  return (
    <aside className="w-64 border-r overflow-y-auto p-2 h-full">
      {editable && (
        <div className="flex justify-end pb-2">
          <button onClick={() => setRootOpen(true)} className="text-xs text-indigo-600">＋ Requirement</button>
        </div>
      )}
      {editable && (
        <AddModal
          open={rootOpen}
          title="Ajouter requirement"
          onCancel={() => setRootOpen(false)}
          onSave={(vals) => {
            addRequirement(vals)
            setRootOpen(false)
          }}
        />
      )}
      <ul>
        {nodes.map((n) => (
          <TreeItem key={n.id} node={n} editable={editable} />
        ))}
      </ul>
    </aside>
  )
}
