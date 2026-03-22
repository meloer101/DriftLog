import { useEffect } from 'react'
import { useProjectStore } from '../../stores/use-project-store'
import { useUIStore } from '../../stores/use-ui-store'
import { ProjectCard } from './ProjectCard'
import { Button } from '../ui/Button'

export function ProjectList() {
  const projects = useProjectStore((s) => s.projects)()
  const fetchProjects = useProjectStore((s) => s.fetchProjects)
  const loading = useProjectStore((s) => s.loading)
  const setView = useUIStore((s) => s.setView)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-panel-text">项目</h2>
        <Button size="sm" onClick={() => setView('create-project')}>
          + 新建
        </Button>
      </div>

      {loading && projects.length === 0 ? (
        <div className="text-center py-8 text-panel-text-muted text-xs">加载中...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-panel-text-muted text-xs mb-3">还没有项目</div>
          <Button size="sm" onClick={() => setView('create-project')}>
            创建第一个项目
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
