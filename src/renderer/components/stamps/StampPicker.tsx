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
import { useStampStore } from '../../stores/use-stamp-store'
import type { Stamp } from '../../../shared/types'
import { StampBadge } from './StampBadge'

interface StampPickerProps {
  selected: string[]
  onChange: (ids: string[]) => void
}

function SortableSelectedRow({
  stampId,
  stamp,
  onRemove
}: {
  stampId: string
  stamp: Stamp | undefined
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stampId
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  }

  if (!stamp) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-2 glass-chip"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-panel-text-muted hover:text-panel-text active:cursor-grabbing"
        aria-label="拖动排序"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <div className="flex-1 min-w-0">
        <StampBadge name={stamp.name} color={stamp.color} />
      </div>
      <button
        type="button"
        className="shrink-0 text-xs text-panel-text-muted hover:text-red-400 px-1"
        onClick={onRemove}
      >
        移除
      </button>
    </div>
  )
}

export function StampPicker({ selected, onChange }: StampPickerProps) {
  const stamps = useStampStore((s) => s.stamps)()
  const fetchStamps = useStampStore((s) => s.fetchStamps)

  const stampById = useMemo(() => {
    const m: Record<string, Stamp> = {}
    stamps.forEach((s) => {
      m[s.id] = s
    })
    return m
  }, [stamps])

  useEffect(() => {
    fetchStamps()
  }, [fetchStamps])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const available = useMemo(
    () => stamps.filter((s) => !selected.includes(s.id)),
    [stamps, selected]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = selected.indexOf(String(active.id))
    const newIndex = selected.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onChange(arrayMove(selected, oldIndex, newIndex))
  }

  const addToSelection = (id: string) => {
    onChange([...selected, id])
  }

  const removeFromSelection = (id: string) => {
    onChange(selected.filter((s) => s !== id))
  }

  if (stamps.length === 0) {
    return <div className="text-xs text-panel-text-muted py-2">请先创建便签</div>
  }

  return (
    <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
      <div>
        <div className="text-[10px] text-panel-text-muted mb-2">已选顺序（可拖动）</div>
        {selected.length === 0 ? (
          <div className="text-xs text-panel-text-muted py-2 px-2">未选择便签，可从下方添加</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selected} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {selected.map((id) => (
                  <SortableSelectedRow
                    key={id}
                    stampId={id}
                    stamp={stampById[id]}
                    onRemove={() => removeFromSelection(id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div>
        <div className="text-[10px] text-panel-text-muted mb-2">便签库（点击添加）</div>
        {available.length === 0 ? (
          <div className="text-xs text-panel-text-muted py-2">已全部加入或无可选便签</div>
        ) : (
          <div className="space-y-2">
            {available.map((stamp) => (
              <button
                key={stamp.id}
                type="button"
                className="w-full flex items-center gap-2 px-2 py-2 rounded-[12px] text-left glass-transition hover:bg-panel-hover border border-transparent active:scale-[0.97]"
                onClick={() => addToSelection(stamp.id)}
              >
                <span className="text-xs text-panel-text-muted">+</span>
                <StampBadge name={stamp.name} color={stamp.color} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
