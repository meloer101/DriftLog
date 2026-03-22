import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-panel-accent hover:bg-panel-accent-hover text-white',
  ghost: 'bg-transparent hover:bg-panel-hover text-panel-text',
  danger: 'bg-transparent hover:bg-red-500/20 text-red-400'
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
