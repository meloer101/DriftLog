import { useEffect, useState } from 'react'
import { useStampStore } from '../../stores/use-stamp-store'
import { useUIStore } from '../../stores/use-ui-store'
import { StampBadge } from './StampBadge'
import { Button } from '../ui/Button'

export function StampLibrary() {
  const stamps = useStampStore((s) => s.stamps)()
  const fetchStamps = useStampStore((s) => s.fetchStamps)
  const deleteStamp = useStampStore((s) => s.deleteStamp)
  const setView = useUIStore((s) => s.setView)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchStamps()
  }, [fetchStamps])

  const handleDelete = async (id: string) => {
    try {
      await deleteStamp(id)
    } catch {
      alert('无法删除正在使用的便签')
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-panel-text tracking-[-0.3px]">便签库</h2>
        <Button size="sm" onClick={() => setView('create-stamp')}>
          + 新建
        </Button>
      </div>

      {stamps.length === 0 ? (
        <div className="text-center py-8 text-panel-text-muted text-xs">
          还没有便签，点击「+ 新建」创建第一个
        </div>
      ) : (
        <div className="space-y-2">
          {stamps.map((stamp) => (
            <div
              key={stamp.id}
              className="flex items-center justify-between py-2 px-2 rounded-[12px] hover:bg-panel-hover glass-transition group"
            >
                <StampBadge name={stamp.name} color={stamp.color} />
                {deletingId === stamp.id ? (
                <div className="flex gap-1">
                  <Button size="sm" variant="danger" onClick={() => handleDelete(stamp.id)}>
                    确认
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeletingId(null)}>
                    取消
                  </Button>
                </div>
                ) : (
                  <button
                  className="text-panel-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 glass-transition text-xs"
                  onClick={() => setDeletingId(stamp.id)}
                  >
                    删除
                  </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
