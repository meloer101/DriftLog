import { useEffect } from 'react'
import { useProjectStore } from '../../stores/use-project-store'
import { useUIStore } from '../../stores/use-ui-store'
import { StampItem } from '../workflow/StampItem'
import { CommitDialog } from '../commits/CommitDialog'

interface ProjectDetailProps {
  projectId: string
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const stamps = useProjectStore((s) => s.projectStampsMap[projectId]) ?? []
  const fetchProjectStamps = useProjectStore((s) => s.fetchProjectStamps)
  const completingStampId = useUIStore((s) => s.completingStampId)

  useEffect(() => {
    fetchProjectStamps(projectId)
  }, [projectId, fetchProjectStamps])

  const completingStamp = stamps.find((s) => s.id === completingStampId)

  return (
    <div className="animate-slide-down">
      {stamps.length === 0 ? (
        <div className="text-xs text-panel-text-muted py-2 px-2">暂无便签</div>
      ) : (
        <div className="space-y-0.5">
          {stamps.map((item) => (
            <StampItem key={item.id} item={item} projectId={projectId} />
          ))}
        </div>
      )}

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
