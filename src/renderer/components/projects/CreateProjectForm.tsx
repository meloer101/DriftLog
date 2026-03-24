import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { StampPicker } from '../stamps/StampPicker'
import { useProjectStore } from '../../stores/use-project-store'
import { useUIStore } from '../../stores/use-ui-store'

export function CreateProjectForm() {
  const [name, setName] = useState('')
  const [selectedStamps, setSelectedStamps] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const createProject = useProjectStore((s) => s.createProject)
  const goBack = useUIStore((s) => s.goBack)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await createProject({ name: name.trim(), stamp_ids: selectedStamps })
    setSaving(false)
    goBack()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-panel-text-muted mb-2">项目名称</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：AI 简历生成器"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs text-panel-text-muted mb-2">
          选择便签 ({selectedStamps.length} 已选)
        </label>
        <StampPicker selected={selectedStamps} onChange={setSelectedStamps} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={goBack}>
          取消
        </Button>
        <Button type="submit" size="sm" disabled={!name.trim() || saving}>
          {saving ? '创建中...' : '创建项目'}
        </Button>
      </div>
    </form>
  )
}
