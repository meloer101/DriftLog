import { useEffect, useMemo, useState } from 'react'
import { useStampStore } from '../../stores/use-stamp-store'
import { useProjectStore } from '../../stores/use-project-store'
import { StampBadge } from '../stamps/StampBadge'
import { Button } from '../ui/Button'

interface AddStampPopoverProps {
  projectId: string
}

export function AddStampPopover({ projectId }: AddStampPopoverProps) {
  const [open, setOpen] = useState(false)
  const stamps = useStampStore((s) => s.stamps)()
  const fetchStamps = useStampStore((s) => s.fetchStamps)
  const projectStamps = useProjectStore((s) => s.projectStampsMap[projectId]) ?? []
  const addStampToProject = useProjectStore((s) => s.addStampToProject)

  const usedStampIds = useMemo(() => new Set(projectStamps.map((ps) => ps.stamp_id)), [projectStamps])

  const available = useMemo(
    () => stamps.filter((s) => !usedStampIds.has(s.id)),
    [stamps, usedStampIds]
  )

  useEffect(() => {
    if (open) {
      void fetchStamps()
    }
  }, [open, fetchStamps])

  const handlePick = async (stampId: string) => {
    await addStampToProject(projectId, stampId)
  }

  return (
    <div className="mt-2 pt-2 border-t border-panel-border/60">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-center text-panel-text-muted hover:text-panel-text"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '− 收起' : '+ 添加便签'}
      </Button>

      {open && (
        <div className="mt-2 rounded-md border border-panel-border bg-panel-bg/50 p-2 max-h-36 overflow-y-auto">
          {available.length === 0 ? (
            <div className="text-[10px] text-panel-text-muted text-center py-2">
              {stamps.length === 0 ? '请先在「便签」页创建便签' : '所有便签已加入本项目'}
            </div>
          ) : (
            <div className="space-y-1">
              {available.map((stamp) => (
                <button
                  key={stamp.id}
                  type="button"
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-left hover:bg-panel-hover transition-colors"
                  onClick={() => void handlePick(stamp.id)}
                >
                  <span className="text-[10px] text-panel-accent">+</span>
                  <StampBadge name={stamp.name} color={stamp.color} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
