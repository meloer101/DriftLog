import { Badge } from '../ui/Badge'

interface StampBadgeProps {
  name: string
  color: string
  size?: 'sm' | 'md'
  className?: string
}

export function StampBadge({ name, color, size = 'sm', className }: StampBadgeProps) {
  return (
    <Badge color={color} size={size} className={className}>
      {name}
    </Badge>
  )
}
