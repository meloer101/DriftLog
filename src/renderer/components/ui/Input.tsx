import { InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full glass-input px-4 py-2 text-sm text-panel-text placeholder:text-panel-text-muted focus:outline-none glass-transition ${className}`}
      {...props}
    />
  )
)

Input.displayName = 'Input'
