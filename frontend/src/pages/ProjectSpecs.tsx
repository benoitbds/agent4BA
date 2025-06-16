import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import HierarchyTree from '../components/HierarchyTree'
import DetailPanel from '../components/DetailPanel'
import { useSpecStore } from '../store/specSlice'

export default function ProjectSpecs() {
  const { id } = useParams<{ id?: string }>()
  const fetchTree = useSpecStore((s) => s.fetchTree)

  useEffect(() => {
    if (id) {
      fetchTree(Number(id))
  }
  }, [id, fetchTree])

  if (!id) {
    return <p className="p-4 text-red-500">Project ID missing</p>
  }

  return (
    <div className="h-full">
      <div className="grid grid-cols-[1fr_2fr] h-full">
        <HierarchyTree />
        <DetailPanel />
      </div>
    </div>
  )
}
