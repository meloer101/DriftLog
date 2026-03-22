import { ProgressBar } from '../ui/ProgressBar'
import { useUIStore } from '../../stores/use-ui-store'
import { ProjectDetail } from './ProjectDetail'
import type { ProjectWithProgress } from '../../../shared/types'

interface ProjectCardProps {
  project: ProjectWithProgress
}

export function ProjectCard({ project }: ProjectCardProps) {
  const expandedProjectId = useUIStore((s) => s.expandedProjectId)
  const toggleProject = useUIStore((s) => s.toggleProject)
  const isExpanded = expandedProjectId === project.id

  return (
    <div className="rounded-lg border border-panel-border bg-panel-surface overflow-hidden">
      <button
        className="w-full text-left px-3 py-2.5 hover:bg-panel-hover transition-colors"
        onClick={() => toggleProject(project.id)}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-panel-text truncate">{project.name}</span>
          <span className="text-xs text-panel-text-muted ml-2">
            {isExpanded ? '▾' : '▸'}
          </span>
        </div>
        <ProgressBar total={project.total_stamps} completed={project.completed_stamps} />
        {project.current_stamp && (
          <div className="mt-1.5 text-xs text-panel-text-muted truncate">
            进行中: {project.current_stamp}
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-panel-border px-2 py-2">
          <ProjectDetail projectId={project.id} />
        </div>
      )}
    </div>
  )
}
