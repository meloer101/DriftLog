import { DEFAULT_STAMP_COLORS } from '../../../shared/constants'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DEFAULT_STAMP_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`w-6 h-6 rounded-full border-2 glass-transition hover:scale-110 ${
            value === color ? 'border-white scale-110' : 'border-transparent'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  )
}
