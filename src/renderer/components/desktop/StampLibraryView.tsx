import { useState } from 'react'
import { useStampStore } from '../../stores/use-stamp-store'
import { StampBadge } from '../stamps/StampBadge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ColorPicker } from '../ui/ColorPicker'
import { DEFAULT_STAMP_COLORS } from '../../../shared/constants'

function CreateStampInline({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_STAMP_COLORS[0])
  const [saving, setSaving] = useState(false)
  const createStamp = useStampStore((s) => s.createStamp)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    await createStamp({ name: name.trim(), color })
    setSaving(false)
    onDone()
  }

  return (
    <div className="px-6 py-4 border-b border-[var(--panel-border)] bg-[var(--panel-hover)] space-y-3">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void handleSubmit()
          if (e.key === 'Escape') onDone()
        }}
        placeholder="便签名称"
        className="text-sm px-3 py-1.5"
      />
      <ColorPicker value={color} onChange={setColor} />
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={onDone}>取消</Button>
        <Button size="sm" disabled={!name.trim() || saving} onClick={handleSubmit}>
          {saving ? '创建中...' : '确认'}
        </Button>
      </div>
    </div>
  )
}

export function StampLibraryView() {
  const stamps = useStampStore((s) => s.stamps)()
  const deleteStamp = useStampStore((s) => s.deleteStamp)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteStamp(id)
    } catch {
      alert('该便签正在被项目使用，请先从项目中移除后再删除。')
    }
    setDeletingId(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--panel-border)]">
        <h1 className="text-base font-semibold text-[rgb(var(--panel-text))] tracking-tight">
          便签库
        </h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          + 新建便签
        </Button>
      </div>

      {/* Create form */}
      {creating && <CreateStampInline onDone={() => setCreating(false)} />}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {stamps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[rgb(var(--panel-text-muted))] gap-3">
            <span className="text-4xl opacity-30">⬡</span>
            <p className="text-sm">暂无便签，点击右上角「+ 新建便签」创建</p>
          </div>
        ) : (
          stamps.map((stamp) => (
            <div
              key={stamp.id}
              className="flex items-center gap-4 px-6 py-3 border-b border-[var(--panel-border)] hover:bg-[var(--panel-hover)] glass-transition group"
            >
              <StampBadge name={stamp.name} color={stamp.color} />
              <span className="flex-1" />
              {deletingId === stamp.id ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="danger" onClick={() => void handleDelete(stamp.id)}>
                    确认删除
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeletingId(null)}>
                    取消
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="text-[rgb(var(--panel-text-muted))] hover:text-red-400 opacity-0 group-hover:opacity-100 glass-transition text-xs"
                  onClick={() => setDeletingId(stamp.id)}
                >
                  删除
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
