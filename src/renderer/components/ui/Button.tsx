import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variantClasses: Record<Variant, string> = {
  primary: 'text-panel-text hover:bg-panel-hover',
  ghost: 'text-panel-text hover:bg-panel-hover',
  danger: 'text-red-400 hover:bg-panel-hover'
}

const sizeClasses = {
  sm: 'px-2 py-2 text-xs',
  md: 'px-4 py-2 text-sm'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`glass-chip rounded-[12px] font-medium glass-transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
