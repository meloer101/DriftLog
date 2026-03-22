interface BadgeProps {
  color: string
  children: React.ReactNode
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ color, children, size = 'sm', className = '' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${sizeClasses} ${className}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  )
}
