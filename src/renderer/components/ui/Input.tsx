import { InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-md border border-panel-border bg-panel-bg px-3 py-1.5 text-sm text-panel-text placeholder:text-panel-text-muted focus:border-panel-accent focus:outline-none transition-colors ${className}`}
      {...props}
    />
  )
)

Input.displayName = 'Input'
