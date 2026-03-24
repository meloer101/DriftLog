import type { KeyboardEvent, MouseEvent } from 'react'
import { ProgressBar } from '../ui/ProgressBar'
import { useProjectStore } from '../../stores/use-project-store'
import { useUIStore } from '../../stores/use-ui-store'
import { ProjectDetail } from './ProjectDetail'
import type { ProjectWithProgress } from '../../../shared/types'

interface ProjectCardProps {
  project: ProjectWithProgress
}

export function ProjectCard({ project }: ProjectCardProps) {
  const expandedProjectId = useUIStore((s) => s.expandedProjectId)
  const toggleProject = useUIStore((s) => s.toggleProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const isExpanded = expandedProjectId === project.id

  const handleHeaderClick = () => {
    toggleProject(project.id)
  }

  const handleHeaderKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleProject(project.id)
    }
  }

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('确认删除项目？此操作不可撤销')) return
    if (isExpanded) {
      toggleProject(project.id)
    }
    void deleteProject(project.id)
  }

  return (
    <div className="rounded-lg border border-panel-border bg-panel-surface overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        className="w-full text-left px-3 py-2.5 hover:bg-panel-hover transition-colors cursor-pointer group"
        onClick={handleHeaderClick}
        onKeyDown={handleHeaderKeyDown}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-panel-text truncate">{project.name}</span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button
              type="button"
              className="opacity-0 group-hover:opacity-100 text-panel-text-muted hover:text-red-400 transition-all text-xs"
              onClick={handleDelete}
              title="删除项目"
            >
              🗑
            </button>
            <span className="text-xs text-panel-text-muted">{isExpanded ? '▾' : '▸'}</span>
          </div>
        </div>
        <ProgressBar total={project.total_stamps} completed={project.completed_stamps} />
        {project.current_stamp && (
          <div className="mt-1.5 text-xs text-panel-text-muted truncate">
            进行中: {project.current_stamp}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-panel-border px-2 py-2">
          <ProjectDetail projectId={project.id} />
        </div>
      )}
    </div>
  )
}
