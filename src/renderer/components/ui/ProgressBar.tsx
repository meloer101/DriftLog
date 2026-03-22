interface ProgressBarProps {
  total: number
  completed: number
  className?: string
}

export function ProgressBar({ total, completed, className = '' }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 rounded-full bg-panel-border overflow-hidden">
        <div
          className="h-full rounded-full bg-panel-accent transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-panel-text-muted tabular-nums w-8 text-right">{percent}%</span>
    </div>
  )
}
