import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSpecStore, type SpecNode } from '../store/specSlice'

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

function findNode(nodes: SpecNode[], id: string): SpecNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const child = findNode(n.children, id)
    if (child) return child
  }
  return null
}

export default function DetailPanel() {
  const selectedId = useSpecStore((s) => s.selectedId)
  const nodes = useSpecStore((s) => s.nodes)
  const rename = useSpecStore((s) => s.rename)
  const node = selectedId ? findNode(nodes, selectedId) : null

  const { register, watch, reset } = useForm<{ name: string; description?: string }>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    reset({ name: node?.title || '', description: (node as any)?.description || '' })
  }, [node, reset])

  const values = watch()

  useEffect(() => {
    if (!node) return
    const t = setTimeout(() => {
      rename(node.id, values.name, values.description)
    }, 400)
    return () => clearTimeout(t)
  }, [values, node, rename])

  if (!node) {
    return <div className="p-4 text-gray-500">Sélectionne un élément</div>
  }

  return (
    <form className="flex flex-col gap-4 p-4" onSubmit={(e) => e.preventDefault()}>
      <label className="flex flex-col">
        <span>Nom</span>
        <input className="border p-2" {...register('name')} />
      </label>
      <label className="flex flex-col">
        <span>Description</span>
        <textarea className="border p-2" {...register('description')} />
      </label>
    </form>
  )
}

