import React, { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import { useSpecStore } from '../store/specSlice'
import type { SpecNode } from '@/types/SpecNode'

function getParentId(n: SpecNode): number | null {
  return (
    n.parent_story_id ?? n.parent_feature_id ?? n.parent_epic_id ?? n.parent_req_id ?? null
  )
}

function TreeItem({ node }: { node: SpecNode }) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)
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
            onBlur={(e) => { update(node.project_id, { ...node, title: e.target.value }); setEditing(false) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                update(node.project_id, { ...node, title: (e.target as HTMLInputElement).value })
                setEditing(false)
              }
            }}
            className="border p-1 text-sm flex-1"
          />
        ) : (
          <span onDoubleClick={() => setEditing(true)}>{node.title}</span>
        )}
        <button
          onClick={() => create(node.project_id, { title: 'New', level: node.level, parent_req_id: node.level === 'requirement' ? node.id : node.parent_req_id, parent_epic_id: node.level === 'epic' ? node.id : node.parent_epic_id, parent_feature_id: node.level === 'feature' ? node.id : node.parent_feature_id, parent_story_id: node.level === 'story' ? node.id : node.parent_story_id })}
          className="ml-auto text-xs"
        >
          ＋
        </button>
        <button onClick={() => setConfirm(true)} className="text-xs text-red-600">
          ✖
        </button>
      </div>
      {open && children.length > 0 && (
        <ul className="pl-4">
          {children.map((c) => (
            <TreeItem key={c.id} node={c} />
          ))}
        </ul>
      )}
      <ConfirmModal
        open={confirm}
        onCancel={() => setConfirm(false)}
        onConfirm={() => { remove(node.project_id, node); setConfirm(false) }}
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
