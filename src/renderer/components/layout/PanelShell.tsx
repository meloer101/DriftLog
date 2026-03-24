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
    <div className="h-screen flex flex-col bg-panel-bg rounded-xl overflow-hidden border border-panel-border/50 shadow-2xl">
      {/* Title bar with drag region */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border select-none">
        <span className="text-xs font-bold text-panel-text tracking-wide">DriftLog</span>
        <div className="flex gap-1">
          <button
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              view === 'projects' || view === 'create-project'
                ? 'bg-panel-accent/20 text-panel-accent'
                : 'text-panel-text-muted hover:text-panel-text'
            }`}
            onClick={() => setView('projects')}
          >
            项目
          </button>
          <button
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              view === 'stamps' || view === 'create-stamp'
                ? 'bg-panel-accent/20 text-panel-accent'
                : 'text-panel-text-muted hover:text-panel-text'
            }`}
            onClick={() => setView('stamps')}
          >
            便签
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">{children}</div>
    </div>
  )
}
