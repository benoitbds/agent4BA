import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import HierarchyTree from '../components/HierarchyTree'
import DetailPanel from '../components/DetailPanel'
import SpecCommandPalette from '../components/SpecCommandPalette'
import { useSpecStore } from '../store/specSlice'

export default function ProjectSpecs() {
  const { id } = useParams<{ id?: string }>()
  const load = useSpecStore((s) => s.load)

  useEffect(() => {
    if (id) {
      load(Number(id))
    }
  }, [id, load])

  if (!id) {
    return <p className="p-4 text-red-500">Project ID missing</p>
  }

  return (
    <div className="h-full">
      <SpecCommandPalette />
      <div className="grid grid-cols-[1fr_2fr] h-full">
        <HierarchyTree />
        <DetailPanel />
      </div>
    </div>
  )
}
