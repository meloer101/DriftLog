import { useEffect } from 'react'
import { useStampStore } from '../../stores/use-stamp-store'
import { StampBadge } from './StampBadge'

interface StampPickerProps {
  selected: string[]
  onChange: (ids: string[]) => void
}

export function StampPicker({ selected, onChange }: StampPickerProps) {
  const stamps = useStampStore((s) => s.stamps)()
  const fetchStamps = useStampStore((s) => s.fetchStamps)

  useEffect(() => {
    fetchStamps()
  }, [fetchStamps])

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  if (stamps.length === 0) {
    return <div className="text-xs text-panel-text-muted py-2">请先创建便签</div>
  }

  return (
    <div className="space-y-1 max-h-32 overflow-y-auto">
      {stamps.map((stamp) => {
        const isSelected = selected.includes(stamp.id)
        return (
          <button
            key={stamp.id}
            type="button"
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
              isSelected
                ? 'bg-panel-accent/20 border border-panel-accent/40'
                : 'hover:bg-panel-hover border border-transparent'
            }`}
            onClick={() => toggle(stamp.id)}
          >
            <span className={`text-xs ${isSelected ? 'text-panel-accent' : 'text-panel-text-muted'}`}>
              {isSelected ? '✓' : '○'}
            </span>
            <StampBadge name={stamp.name} color={stamp.color} />
          </button>
        )
      })}
    </div>
  )
}
