interface BadgeProps {
  color: string
  children: React.ReactNode
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ color, children, size = 'sm', className = '' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-2' : 'text-sm px-4 py-2'

  return (
    <span
      className={`inline-flex items-center gap-1 glass-badge font-medium text-panel-text ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  )
}
