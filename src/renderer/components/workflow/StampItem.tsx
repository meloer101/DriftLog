import type { DraggableAttributes } from '@dnd-kit/core'
import { StampBadge } from '../stamps/StampBadge'
import { useProjectStore } from '../../stores/use-project-store'
import { useUIStore } from '../../stores/use-ui-store'
import type { ProjectStampWithDetails } from '../../../shared/types'

interface StampItemProps {
  item: ProjectStampWithDetails
  projectId: string
  /** 拖拽手柄（来自 useSortable），不传则不显示手柄 */
  dragHandleProps?: {
    attributes: DraggableAttributes
    listeners: Record<string, unknown> | undefined
  }
}

const statusIndicator: Record<string, string> = {
  pending: '○',
  in_progress: '◉',
  completed: '✓'
}

const statusStyle: Record<string, string> = {
  pending: 'text-panel-text-muted',
  in_progress: 'text-yellow-400',
  completed: 'text-green-400'
}

export function StampItem({ item, projectId, dragHandleProps }: StampItemProps) {
  const setCompletingStamp = useUIStore((s) => s.setCompletingStamp)
  const removeStampFromProject = useProjectStore((s) => s.removeStampFromProject)

  return (
    <div
      className={`flex items-center gap-2 px-2 py-2 rounded-[12px] group glass-transition ${
        item.status === 'completed' ? 'opacity-60' : 'hover:bg-panel-hover'
      }`}
    >
      {dragHandleProps && (
        <button
          type="button"
          className="cursor-grab touch-none text-panel-text-muted hover:text-panel-text shrink-0 active:cursor-grabbing"
          aria-label="拖动排序"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          ⠿
        </button>
      )}

      <span className={`text-xs shrink-0 ${statusStyle[item.status]}`}>
        {statusIndicator[item.status]}
      </span>

      <div className="flex-1 min-w-0">
        <StampBadge
          name={item.stamp_name}
          color={item.stamp_color}
          className={item.status === 'completed' ? 'line-through' : ''}
        />
      </div>

      {item.status !== 'completed' && (
        <button
          type="button"
          className="text-green-400 hover:text-green-300 opacity-0 group-hover:opacity-100 glass-transition text-sm shrink-0"
          onClick={() => setCompletingStamp(item.id)}
          title="标记完成"
        >
          ✅
        </button>
      )}

      <button
        type="button"
        className="text-panel-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 glass-transition text-xs shrink-0"
        onClick={() => void removeStampFromProject(item.id, projectId)}
        title="从项目中移除"
      >
        ✕
      </button>
    </div>
  )
}
