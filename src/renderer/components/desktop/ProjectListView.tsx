import { useState } from 'react'
import { useProjectStore } from '../../stores/use-project-store'
import { useDesktopUIStore } from '../../stores/use-desktop-ui-store'
import { ProgressBar } from '../ui/ProgressBar'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { ProjectWithProgress } from '../../../shared/types'

const statusGroups = [
  { key: 'in_progress', label: '进行中', icon: '◉', iconClass: 'text-yellow-400' },
  { key: 'pending', label: '待开始', icon: '○', iconClass: 'text-[rgb(var(--panel-text-muted))]' },
  { key: 'done', label: '已完成', icon: '✓', iconClass: 'text-green-400' }
] as const

type GroupKey = (typeof statusGroups)[number]['key']

function getProjectGroup(project: ProjectWithProgress): GroupKey {
  if (project.completed_stamps > 0 && project.completed_stamps === project.total_stamps && project.total_stamps > 0) {
    return 'done'
  }
  if (project.current_stamp) return 'in_progress'
  return 'pending'
}

function ProjectRow({ project }: { project: ProjectWithProgress }) {
  const selectProject = useDesktopUIStore((s) => s.selectProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const archiveProject = useProjectStore((s) => s.archiveProject)

  const pct =
    project.total_stamps > 0
      ? Math.round((project.completed_stamps / project.total_stamps) * 100)
      : 0

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-4 px-6 py-3 border-b border-[var(--panel-border)] hover:bg-[var(--panel-hover)] glass-transition cursor-pointer group"
      onClick={() => selectProject(project.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && selectProject(project.id)}
    >
      {/* Name */}
      <span className="flex-1 text-sm font-medium truncate text-[rgb(var(--panel-text))]">
        {project.name}
      </span>

      {/* Current stamp */}
      {project.current_stamp && (
        <span className="text-xs text-[rgb(var(--panel-text-muted))] hidden lg:block max-w-[160px] truncate">
          {project.current_stamp}
        </span>
      )}

      {/* Progress */}
      <div className="w-[100px] shrink-0">
        <ProgressBar total={project.total_stamps} completed={project.completed_stamps} />
      </div>

      {/* Stats */}
      <span className="text-xs text-[rgb(var(--panel-text-muted))] w-[48px] text-right shrink-0">
        {project.completed_stamps}/{project.total_stamps}
      </span>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 glass-transition shrink-0">
        <button
          type="button"
          title="归档"
          className="text-[rgb(var(--panel-text-muted))] hover:text-[rgb(var(--panel-text))] text-xs px-1"
          onClick={(e) => {
            e.stopPropagation()
            void archiveProject(project.id)
          }}
        >
          ⊙
        </button>
        <button
          type="button"
          title="删除"
          className="text-[rgb(var(--panel-text-muted))] hover:text-red-400 text-xs px-1"
          onClick={(e) => {
            e.stopPropagation()
            if (window.confirm('确认删除项目？此操作不可撤销')) {
              void deleteProject(project.id)
            }
          }}
        >
          🗑
        </button>
      </div>
    </div>
  )
}

function GroupSection({
  group,
  projects
}: {
  group: (typeof statusGroups)[number]
  projects: ProjectWithProgress[]
}) {
  const [collapsed, setCollapsed] = useState(false)

  if (projects.length === 0) return null

  return (
    <div>
      <button
        type="button"
        className="w-full flex items-center gap-2 px-6 py-2 hover:bg-[var(--panel-hover)] glass-transition"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className={`text-xs ${group.iconClass}`}>{group.icon}</span>
        <span className="text-xs font-semibold text-[rgb(var(--panel-text-muted))] uppercase tracking-wider">
          {group.label}
        </span>
        <span className="text-xs text-[rgb(var(--panel-text-muted))] ml-1">{projects.length}</span>
        <span className="ml-auto text-[10px] text-[rgb(var(--panel-text-muted))]">
          {collapsed ? '▸' : '▾'}
        </span>
      </button>
      {!collapsed &&
        projects.map((p) => <ProjectRow key={p.id} project={p} />)}
    </div>
  )
}

export function ProjectListView() {
  const projects = useProjectStore((s) => s.projects)()
  const createProject = useProjectStore((s) => s.createProject)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const grouped = statusGroups.reduce<Record<GroupKey, ProjectWithProgress[]>>(
    (acc, g) => ({ ...acc, [g.key]: [] }),
    {} as Record<GroupKey, ProjectWithProgress[]>
  )
  projects.forEach((p) => {
    grouped[getProjectGroup(p)].push(p)
  })

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    await createProject({ name: newName.trim() })
    setNewName('')
    setCreating(false)
    setSaving(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--panel-border)]">
        <h1 className="text-base font-semibold text-[rgb(var(--panel-text))] tracking-tight">
          所有项目
        </h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          + 新建项目
        </Button>
      </div>

      {/* Create form inline */}
      {creating && (
        <div className="px-6 py-3 border-b border-[var(--panel-border)] bg-[var(--panel-hover)] flex items-center gap-3">
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleCreate()
              if (e.key === 'Escape') setCreating(false)
            }}
            placeholder="项目名称"
            className="flex-1 text-sm px-3 py-1.5"
          />
          <Button size="sm" disabled={!newName.trim() || saving} onClick={handleCreate}>
            {saving ? '创建中...' : '确认'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setCreating(false); setNewName('') }}>
            取消
          </Button>
        </div>
      )}

      {/* Column headers */}
      {projects.length > 0 && (
        <div className="flex items-center gap-4 px-6 py-2 border-b border-[var(--panel-border)] bg-[var(--panel-hover)]">
          <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--panel-text-muted))] opacity-60">
            项目名称
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--panel-text-muted))] opacity-60 hidden lg:block w-[160px]">
            当前便签
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--panel-text-muted))] opacity-60 w-[100px]">
            进度
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--panel-text-muted))] opacity-60 w-[48px] text-right">
            完成
          </span>
          <div className="w-[48px]" />
        </div>
      )}

      {/* Groups */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[rgb(var(--panel-text-muted))] gap-3">
            <span className="text-4xl opacity-30">◈</span>
            <p className="text-sm">暂无项目，点击右上角「+ 新建项目」开始</p>
          </div>
        ) : (
          statusGroups.map((g) => (
            <GroupSection key={g.key} group={g} projects={grouped[g.key]} />
          ))
        )}
      </div>
    </div>
  )
}
