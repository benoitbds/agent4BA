import NodeForm from './NodeForm'
import { useRequirementsStore } from '../../store/requirements'
import type { RequirementNode } from '../../store/requirements'

interface Props {
  node?: RequirementNode
  parentId?: number
}

export default function UserStoryForm({ node, parentId }: Props) {
  const update = useRequirementsStore((s) => s.updateNode)
  const add = useRequirementsStore((s) => s.addNode)

  const onSave = async (values: { title: string; description: string }) => {
    if (node) {
      await update(node.id, values)
    } else {
      await add(parentId, { level: 'story', ...values })
    }
  }

  return <NodeForm title={node?.title} description={node?.description} onSave={onSave} />
}
