import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_STAMP_COLORS } from '../../../shared/constants'
import { useStampStore } from '../../stores/use-stamp-store'
import { useProjectStore } from '../../stores/use-project-store'
import { StampBadge } from '../stamps/StampBadge'
import { Button } from '../ui/Button'
import { ColorPicker } from '../ui/ColorPicker'
import { Input } from '../ui/Input'

interface AddStampPopoverProps {
  projectId: string
}

export function AddStampPopover({ projectId }: AddStampPopoverProps) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(DEFAULT_STAMP_COLORS[0])
  const [savingCreate, setSavingCreate] = useState(false)
  const stamps = useStampStore((s) => s.stamps)()
  const fetchStamps = useStampStore((s) => s.fetchStamps)
  const createStamp = useStampStore((s) => s.createStamp)
  const projectStamps = useProjectStore((s) => s.projectStampsMap[projectId]) ?? []
  const addStampToProject = useProjectStore((s) => s.addStampToProject)

  const usedStampIds = useMemo(() => new Set(projectStamps.map((ps) => ps.stamp_id)), [projectStamps])

  const available = useMemo(
    () => stamps.filter((s) => !usedStampIds.has(s.id)),
    [stamps, usedStampIds]
  )

  useEffect(() => {
    if (open) {
      void fetchStamps()
    }
  }, [open, fetchStamps])

  const handlePick = async (stampId: string) => {
    await addStampToProject(projectId, stampId)
  }

  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return
    setSavingCreate(true)
    const created = await createStamp({ name: newName.trim(), color: newColor })
    await addStampToProject(projectId, created.id)
    await fetchStamps()
    setNewName('')
    setNewColor(DEFAULT_STAMP_COLORS[0])
    setCreating(false)
    setSavingCreate(false)
  }

  return (
    <div className="mt-2 pt-2 border-t border-panel-border">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-center text-panel-text-muted hover:text-panel-text"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '− 收起' : '+ 添加便签'}
      </Button>

      {open && (
        <div className="mt-2 solid-glass-sheet p-2 max-h-36 overflow-y-auto">
          {available.length === 0 ? (
            <div className="text-[10px] text-panel-text-muted text-center py-2">
              {stamps.length === 0 ? '请先在「便签」页创建便签' : '所有便签已加入本项目'}
            </div>
          ) : (
            <div className="space-y-1">
              {available.map((stamp) => (
                <button
                  key={stamp.id}
                  type="button"
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-[12px] text-left hover:bg-panel-hover glass-transition active:scale-[0.97]"
                  onClick={() => void handlePick(stamp.id)}
                >
                  <span className="text-[10px] text-panel-text-muted">+</span>
                  <StampBadge name={stamp.name} color={stamp.color} />
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-panel-border">
            {!creating ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-center text-panel-text-muted hover:text-panel-text"
                onClick={() => setCreating(true)}
              >
                + 创建新便签
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="新便签名称"
                  className="px-3 py-1.5 text-xs"
                />
                <ColorPicker value={newColor} onChange={setNewColor} />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCreating(false)
                      setNewName('')
                      setNewColor(DEFAULT_STAMP_COLORS[0])
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!newName.trim() || savingCreate}
                    onClick={() => void handleCreateAndAdd()}
                  >
                    {savingCreate ? '创建中...' : '确认创建'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
