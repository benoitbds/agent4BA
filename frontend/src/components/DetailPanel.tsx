import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSpecStore } from '../store/specSlice'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function DetailPanel() {
  const selectedId = useSpecStore(s => s.selectedId)
  const nodes = useSpecStore(s => s.nodes)
  const update = useSpecStore(s => s.update)
  const node = nodes.find(n => n.id === selectedId) || null

  const { register, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '' },
  })

  const [tab, setTab] = useState<'general' | 'json'>('general')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    reset({ title: node?.title || '', description: node?.description || '' })
  }, [node, reset])

  useEffect(() => {
    const sub = watch(values => {
      if (!node) return
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        update(node.project_id, { ...node, ...values })
      }, 800)
    })
    return () => sub.unsubscribe()
  }, [watch, node, update])

  if (!node) {
    return <div className='p-4 text-gray-500'>Select an item</div>
  }

  return (
    <div className='p-4 h-full flex flex-col'>
      <div className='border-b mb-2 space-x-2'>
        <button
          className={tab === 'general' ? 'font-semibold' : ''}
          onClick={() => setTab('general')}
        >
          General
        </button>
        <button
          className={tab === 'json' ? 'font-semibold' : ''}
          onClick={() => setTab('json')}
        >
          JSON
        </button>
      </div>
      {tab === 'general' ? (
        <form className='flex flex-col gap-2'>
          <input
            {...register('title')}
            className='border p-2 rounded'
            placeholder='Title'
          />
          <textarea
            {...register('description')}
            className='border p-2 rounded h-32'
            placeholder='Description'
          />
        </form>
      ) : (
        <pre className='text-sm flex-1 overflow-auto bg-gray-50 p-2 rounded'>
          {JSON.stringify(node, null, 2)}
        </pre>
      )}
    </div>
  )
}
