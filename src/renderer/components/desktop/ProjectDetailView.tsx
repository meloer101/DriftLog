import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useProjectStore } from '../../stores/use-project-store'
import { useDesktopUIStore } from '../../stores/use-desktop-ui-store'
import { StampBadge } from '../stamps/StampBadge'
import { AddStampPopover } from '../projects/AddStampPopover'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import type { ProjectStampWithDetails } from '../../../shared/types'

const statusIndicator: Record<string, string> = {
  pending: '○',
  in_progress: '◉',
  completed: '✓'
}
const statusStyle: Record<string, string> = {
  pending: 'text-[rgb(var(--panel-text-muted))]',
  in_progress: 'text-yellow-400',
  completed: 'text-green-400'
}
const statusOrder = ['in_progress', 'pending', 'completed']
const statusLabel: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成'
}

function DesktopCommitDialog({
  projectStampId,
  projectId,
  stampName,
  onClose
}: {
  projectStampId: string
  projectId: string
  stampName: string
  onClose: () => void
}) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const completeStamp = useProjectStore((s) => s.completeStamp)

  const handleSubmit = async () => {
    setSaving(true)
    await completeStamp({ project_stamp_id: projectStampId, project_id: projectId, note: note.trim() })
    setSaving(false)
    onClose()
  }

  return (
    <Dialog open title={`完成：${stampName}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-[rgb(var(--panel-text-muted))] mb-2">备注（可选）</label>
          <textarea
            className="w-full glass-input px-4 py-2 text-sm text-[rgb(var(--panel-text))] placeholder:text-[rgb(var(--panel-text-muted))] focus:outline-none glass-transition resize-none"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="记录一些心得..."
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? '提交中...' : '确认完成'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

function SortableStampRow({ item, projectId }: { item: ProjectStampWithDetails; projectId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const setCompletingStamp = useDesktopUIStore((s) => s.setCompletingStamp)
  const removeStampFromProject = useProjectStore((s) => s.removeStampFromProject)

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.55 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-6 py-3 border-b border-[var(--panel-border)] group glass-transition ${
        item.status === 'completed' ? 'opacity-60' : 'hover:bg-[var(--panel-hover)]'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-[rgb(var(--panel-text-muted))] hover:text-[rgb(var(--panel-text))] shrink-0 active:cursor-grabbing opacity-0 group-hover:opacity-100"
        aria-label="拖动排序"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>

      {/* Status indicator */}
      <span className={`text-sm shrink-0 ${statusStyle[item.status]}`}>
        {statusIndicator[item.status]}
      </span>

      {/* Badge */}
      <div className="flex-1 min-w-0">
        <StampBadge
          name={item.stamp_name}
          color={item.stamp_color}
          className={item.status === 'completed' ? 'line-through' : ''}
        />
      </div>

      {/* Actions */}
      {item.status !== 'completed' && (
        <button
          type="button"
          className="text-green-400 hover:text-green-300 opacity-0 group-hover:opacity-100 glass-transition text-sm shrink-0"
          onClick={() => setCompletingStamp(item.id)}
          title="标记完成"
        >
          ✅
        </button>
      )}
      <button
        type="button"
        className="text-[rgb(var(--panel-text-muted))] hover:text-red-400 opacity-0 group-hover:opacity-100 glass-transition text-xs shrink-0"
        onClick={() => void removeStampFromProject(item.id, projectId)}
        title="从项目中移除"
      >
        ✕
      </button>
    </div>
  )
}

function StatusGroup({
  status,
  items,
  projectId
}: {
  status: string
  items: ProjectStampWithDetails[]
  projectId: string
}) {
  const [collapsed, setCollapsed] = useState(false)
  if (items.length === 0) return null

  const sortableIds = items.map((i) => i.id)

  return (
    <div>
      <button
        type="button"
        className="w-full flex items-center gap-2 px-6 py-2 hover:bg-[var(--panel-hover)] glass-transition"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className={`text-xs ${statusStyle[status]}`}>{statusIndicator[status]}</span>
        <span className="text-xs font-semibold text-[rgb(var(--panel-text-muted))] uppercase tracking-wider">
          {statusLabel[status]}
        </span>
        <span className="text-xs text-[rgb(var(--panel-text-muted))] ml-1">{items.length}</span>
        <span className="ml-auto text-[10px] text-[rgb(var(--panel-text-muted))]">
          {collapsed ? '▸' : '▾'}
        </span>
      </button>
      {!collapsed && (
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableStampRow key={item.id} item={item} projectId={projectId} />
          ))}
        </SortableContext>
      )}
    </div>
  )
}

interface ProjectDetailViewProps {
  projectId: string
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const project = useProjectStore((s) => s.projectMap[projectId])
  const stamps = useProjectStore((s) => s.projectStampsMap[projectId]) ?? []
  const fetchProjectStamps = useProjectStore((s) => s.fetchProjectStamps)
  const reorderProjectStamps = useProjectStore((s) => s.reorderProjectStamps)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const goBack = useDesktopUIStore((s) => s.goBack)
  const completingStampId = useDesktopUIStore((s) => s.completingStampId)
  const setCompletingStamp = useDesktopUIStore((s) => s.setCompletingStamp)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    void fetchProjectStamps(projectId)
  }, [projectId, fetchProjectStamps])

  const grouped = useMemo(() => {
    const map: Record<string, ProjectStampWithDetails[]> = {
      in_progress: [],
      pending: [],
      completed: []
    }
    stamps.forEach((s) => map[s.status]?.push(s))
    return map
  }, [stamps])

  const allIds = useMemo(() => stamps.map((s) => s.id), [stamps])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = allIds.indexOf(String(active.id))
    const newIndex = allIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    const nextOrder = arrayMove(allIds, oldIndex, newIndex)
    void reorderProjectStamps(projectId, nextOrder)
  }

  const completingStamp = stamps.find((s) => s.id === completingStampId)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--panel-border)]">
        <button
          type="button"
          className="text-[rgb(var(--panel-text-muted))] hover:text-[rgb(var(--panel-text))] text-sm glass-transition"
          onClick={goBack}
        >
          ←
        </button>
        <h1 className="flex-1 text-base font-semibold text-[rgb(var(--panel-text))] tracking-tight truncate">
          {project?.name ?? '项目详情'}
        </h1>
        {project && (
          <button
            type="button"
            className="text-[rgb(var(--panel-text-muted))] hover:text-red-400 text-xs glass-transition"
            onClick={() => {
              if (window.confirm('确认删除项目？此操作不可撤销')) {
                void deleteProject(projectId)
                goBack()
              }
            }}
          >
            🗑 删除项目
          </button>
        )}
      </div>

      {/* Stamp list */}
      <div className="flex-1 overflow-y-auto">
        {stamps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-[rgb(var(--panel-text-muted))] gap-3">
            <span className="text-3xl opacity-30">⬡</span>
            <p className="text-sm">暂无便签，点击下方「+ 添加便签」</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {statusOrder.map((status) => (
              <StatusGroup
                key={status}
                status={status}
                items={grouped[status] ?? []}
                projectId={projectId}
              />
            ))}
          </DndContext>
        )}

        {/* Add stamp */}
        <div className="px-4 py-2">
          <AddStampPopover projectId={projectId} />
        </div>
      </div>

      {/* Commit dialog */}
      {completingStamp && (
        <DesktopCommitDialog
          projectStampId={completingStamp.id}
          projectId={projectId}
          stampName={completingStamp.stamp_name}
          onClose={() => setCompletingStamp(null)}
        />
      )}
    </div>
  )
}
