import { StampBadge } from '../stamps/StampBadge'
import { useUIStore } from '../../stores/use-ui-store'
import type { ProjectStampWithDetails } from '../../../shared/types'

interface StampItemProps {
  item: ProjectStampWithDetails
  projectId: string
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

export function StampItem({ item, projectId }: StampItemProps) {
  const setCompletingStamp = useUIStore((s) => s.setCompletingStamp)

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md group ${
        item.status === 'completed' ? 'opacity-60' : 'hover:bg-panel-hover'
      }`}
    >
      <span className={`text-xs ${statusStyle[item.status]}`}>
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
          className="text-green-400 hover:text-green-300 opacity-0 group-hover:opacity-100 transition-all text-sm"
          onClick={() => setCompletingStamp(item.id)}
          title="标记完成"
        >
          ✅
        </button>
      )}
    </div>
  )
}
