import { useState } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { useProjectStore } from '../../stores/use-project-store'
import { useUIStore } from '../../stores/use-ui-store'

interface CommitDialogProps {
  projectStampId: string
  projectId: string
  stampName: string
}

export function CommitDialog({ projectStampId, projectId, stampName }: CommitDialogProps) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const completeStamp = useProjectStore((s) => s.completeStamp)
  const setCompletingStamp = useUIStore((s) => s.setCompletingStamp)

  const handleSubmit = async () => {
    setSaving(true)
    await completeStamp({
      project_stamp_id: projectStampId,
      project_id: projectId,
      note: note.trim()
    })
    setSaving(false)
    setCompletingStamp(null)
  }

  return (
    <Dialog open title={`完成：${stampName}`} onClose={() => setCompletingStamp(null)}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-panel-text-muted mb-2">备注（可选）</label>
          <textarea
            className="w-full glass-input px-4 py-2 text-sm text-panel-text placeholder:text-panel-text-muted focus:outline-none glass-transition resize-none"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="记录一些心得..."
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setCompletingStamp(null)}>
            取消
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? '提交中...' : '确认完成'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
