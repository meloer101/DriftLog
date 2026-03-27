import { useEffect } from 'react'
import { useProjectStore } from '../../stores/use-project-store'
import { useDesktopUIStore } from '../../stores/use-desktop-ui-store'
import { ProgressBar } from '../ui/ProgressBar'

export function Sidebar() {
  const projects = useProjectStore((s) => s.projects)()
  const fetchProjects = useProjectStore((s) => s.fetchProjects)
  const view = useDesktopUIStore((s) => s.view)
  const selectedProjectId = useDesktopUIStore((s) => s.selectedProjectId)
  const setView = useDesktopUIStore((s) => s.setView)
  const selectProject = useDesktopUIStore((s) => s.selectProject)

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  return (
    <aside className="w-[220px] shrink-0 flex flex-col border-r border-[var(--panel-border)] bg-[var(--desktop-sidebar-bg)] overflow-y-auto">
      {/* Navigation section */}
      <div className="px-2 pt-3 pb-2">
        <SidebarItem
          label="所有项目"
          icon="◈"
          active={view === 'all-projects'}
          onClick={() => setView('all-projects')}
          count={projects.length}
        />
        <SidebarItem
          label="便签库"
          icon="⬡"
          active={view === 'stamps'}
          onClick={() => setView('stamps')}
        />
      </div>

      {/* Projects list */}
      {projects.length > 0 && (
        <>
          <div className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--panel-text-muted))] opacity-60">
              项目
            </span>
          </div>
          <div className="px-2 pb-3 space-y-0.5">
            {projects.map((project) => {
              const isSelected = view === 'project-detail' && selectedProjectId === project.id
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => selectProject(project.id)}
                  className={`w-full text-left px-3 py-2 rounded-[10px] glass-transition group ${
                    isSelected
                      ? 'bg-[var(--panel-hover)] text-[rgb(var(--panel-text))]'
                      : 'text-[rgb(var(--panel-text-muted))] hover:bg-[var(--panel-hover)] hover:text-[rgb(var(--panel-text))]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] shrink-0">▸</span>
                    <span className="text-xs font-medium truncate">{project.name}</span>
                  </div>
                  <div className="pl-4">
                    <ProgressBar
                      total={project.total_stamps}
                      completed={project.completed_stamps}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </aside>
  )
}

function SidebarItem({
  label,
  icon,
  active,
  onClick,
  count
}: {
  label: string
  icon: string
  active: boolean
  onClick: () => void
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] glass-transition ${
        active
          ? 'bg-[var(--panel-hover)] text-[rgb(var(--panel-text))]'
          : 'text-[rgb(var(--panel-text-muted))] hover:bg-[var(--panel-hover)] hover:text-[rgb(var(--panel-text))]'
      }`}
    >
      <span className="text-xs w-4 text-center shrink-0">{icon}</span>
      <span className="text-sm font-medium flex-1 text-left">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] text-[rgb(var(--panel-text-muted))]">{count}</span>
      )}
    </button>
  )
}
