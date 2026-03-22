import { useEffect, useRef } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 flex items-start justify-center bg-black/40 pt-12 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="w-[340px] rounded-lg bg-panel-surface border border-panel-border shadow-2xl animate-slide-down">
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
          <h2 className="text-sm font-semibold text-panel-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-panel-text-muted hover:text-panel-text transition-colors text-lg leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
