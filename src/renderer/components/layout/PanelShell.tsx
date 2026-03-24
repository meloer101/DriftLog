import { useEffect } from 'react'
import { useUIStore } from '../../stores/use-ui-store'

interface PanelShellProps {
  children: React.ReactNode
}

export function PanelShell({ children }: PanelShellProps) {
  const view = useUIStore((s) => s.view)
  const setView = useUIStore((s) => s.setView)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      void window.api.window.hide()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex flex-col glass-panel overflow-hidden px-0 relative">
      {/* Title bar with drag region */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border select-none">
        <span className="text-xs font-semibold text-panel-text tracking-[-0.3px]">DriftLog</span>
        <div className="flex gap-1">
          <button
            className={`px-2 py-2 rounded-[12px] text-xs glass-transition active:scale-[0.97] ${
              view === 'projects' || view === 'create-project'
                ? 'bg-panel-hover text-panel-text'
                : 'text-panel-text-muted hover:bg-panel-hover hover:text-panel-text'
            }`}
            onClick={() => setView('projects')}
          >
            项目
          </button>
          <button
            className={`px-2 py-2 rounded-[12px] text-xs glass-transition active:scale-[0.97] ${
              view === 'stamps' || view === 'create-stamp'
                ? 'bg-panel-hover text-panel-text'
                : 'text-panel-text-muted hover:bg-panel-hover hover:text-panel-text'
            }`}
            onClick={() => setView('stamps')}
          >
            便签
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

      <div id="dialog-root" className="absolute inset-0 pointer-events-none z-50" />
    </div>
  )
}
