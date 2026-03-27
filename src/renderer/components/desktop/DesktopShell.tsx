import { useDesktopUIStore } from '../../stores/use-desktop-ui-store'
import { Sidebar } from './Sidebar'
import { ProjectListView } from './ProjectListView'
import { ProjectDetailView } from './ProjectDetailView'
import { StampLibraryView } from './StampLibraryView'

function MainContent() {
  const view = useDesktopUIStore((s) => s.view)
  const selectedProjectId = useDesktopUIStore((s) => s.selectedProjectId)

  switch (view) {
    case 'all-projects':
      return <ProjectListView />
    case 'project-detail':
      return selectedProjectId ? <ProjectDetailView projectId={selectedProjectId} /> : <ProjectListView />
    case 'stamps':
      return <StampLibraryView />
    default:
      return <ProjectListView />
  }
}

export function DesktopShell() {
  return (
    <div className="h-screen flex flex-col bg-[var(--desktop-bg)] text-[rgb(var(--panel-text))] overflow-hidden">
      {/* macOS traffic light spacer */}
      <div className="h-[52px] shrink-0 flex items-center px-4 border-b border-[var(--panel-border)] [-webkit-app-region:drag]">
        <div className="w-[72px] shrink-0" />
        <span className="flex-1 text-center text-sm font-semibold tracking-tight select-none text-[rgb(var(--panel-text))]">
          DriftLog
        </span>
        <div className="w-[72px] shrink-0" />
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[var(--desktop-main-bg)]">
          <MainContent />
        </main>
      </div>

      <div id="dialog-root" className="fixed inset-0 pointer-events-none z-50" />
    </div>
  )
}
