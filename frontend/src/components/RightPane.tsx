import RequirementForm from './forms/RequirementForm'
import EpicForm from './forms/EpicForm'
import FeatureForm from './forms/FeatureForm'
import UserStoryForm from './forms/UserStoryForm'
import UseCaseForm from './forms/UseCaseForm'
import { useRequirementsStore, type RequirementNode } from '../store/requirements'

function findNode(nodes: RequirementNode[], id: number): RequirementNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const child = findNode(n.children, id)
    if (child) return child
  }
  return null
}

export default function RightPane() {
  const { tree, selectedId } = useRequirementsStore()
  const node = selectedId ? findNode(tree, selectedId) : null

  return (
    <div className="flex-1 p-6 bg-white rounded mx-auto h-[calc(100vh-4rem)] overflow-y-auto">
      {!node ? (
        <p className="text-gray-500">Sélectionne ou crée un élément</p>
      ) : node.level === 'requirement' ? (
        <RequirementForm node={node} />
      ) : node.level === 'epic' ? (
        <EpicForm node={node} />
      ) : node.level === 'feature' ? (
        <FeatureForm node={node} />
      ) : node.level === 'story' ? (
        <UserStoryForm node={node} />
      ) : (
        <UseCaseForm node={node} />
      )}
    </div>
  )
}
