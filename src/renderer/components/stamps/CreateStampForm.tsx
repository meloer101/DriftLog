import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ColorPicker } from '../ui/ColorPicker'
import { DEFAULT_STAMP_COLORS } from '../../../shared/constants'
import { useStampStore } from '../../stores/use-stamp-store'
import { useUIStore } from '../../stores/use-ui-store'

export function CreateStampForm() {
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_STAMP_COLORS[0])
  const [saving, setSaving] = useState(false)
  const createStamp = useStampStore((s) => s.createStamp)
  const goBack = useUIStore((s) => s.goBack)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await createStamp({ name: name.trim(), color })
    setSaving(false)
    goBack()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-panel-text-muted mb-2">便签名称</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：构建界面"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs text-panel-text-muted mb-2">颜色</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={goBack}>
          取消
        </Button>
        <Button type="submit" size="sm" disabled={!name.trim() || saving}>
          {saving ? '创建中...' : '创建便签'}
        </Button>
      </div>
    </form>
  )
}
