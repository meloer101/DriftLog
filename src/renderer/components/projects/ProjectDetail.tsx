import { useEffect, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useProjectStore } from '../../stores/use-project-store'
import { useUIStore } from '../../stores/use-ui-store'
import { StampItem } from '../workflow/StampItem'
import { CommitDialog } from '../commits/CommitDialog'
import { AddStampPopover } from './AddStampPopover'
import type { ProjectStampWithDetails } from '../../../shared/types'

interface ProjectDetailProps {
  projectId: string
}

function SortableProjectStampRow({
  item,
  projectId
}: {
  item: ProjectStampWithDetails
  projectId: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      <StampItem
        item={item}
        projectId={projectId}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  )
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const stamps = useProjectStore((s) => s.projectStampsMap[projectId]) ?? []
  const fetchProjectStamps = useProjectStore((s) => s.fetchProjectStamps)
  const reorderProjectStamps = useProjectStore((s) => s.reorderProjectStamps)
  const completingStampId = useUIStore((s) => s.completingStampId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sortableIds = useMemo(() => stamps.map((s) => s.id), [stamps])

  useEffect(() => {
    fetchProjectStamps(projectId)
  }, [projectId, fetchProjectStamps])

  const completingStamp = stamps.find((s) => s.id === completingStampId)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sortableIds.indexOf(String(active.id))
    const newIndex = sortableIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    const nextOrder = arrayMove(sortableIds, oldIndex, newIndex)
    void reorderProjectStamps(projectId, nextOrder)
  }

  return (
    <div className="animate-slide-down">
      {stamps.length === 0 ? (
        <div className="text-xs text-panel-text-muted py-2 px-2">暂无便签</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-0.5">
              {stamps.map((item) => (
                <SortableProjectStampRow key={item.id} item={item} projectId={projectId} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddStampPopover projectId={projectId} />

      {completingStamp && (
        <CommitDialog
          projectStampId={completingStamp.id}
          projectId={projectId}
          stampName={completingStamp.stamp_name}
        />
      )}
    </div>
  )
}
