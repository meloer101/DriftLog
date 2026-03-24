import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open || !mounted) return null

  const dialogRoot = document.getElementById('dialog-root')
  if (!dialogRoot) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="dialog-overlay absolute inset-0 pointer-events-auto z-50 flex items-start justify-center pt-12 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="w-[340px] solid-glass-sheet animate-slide-down overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border">
          <h2 className="text-sm font-semibold text-panel-text tracking-[-0.3px]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-panel-text-muted hover:text-panel-text glass-transition text-lg leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    dialogRoot
  )
}
