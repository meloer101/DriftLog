import { useEffect } from 'react'
import { useProjectStore } from './stores/use-project-store'
import { useStampStore } from './stores/use-stamp-store'
import { DesktopShell } from './components/desktop/DesktopShell'

export default function DesktopApp() {
  const fetchProjects = useProjectStore((s) => s.fetchProjects)
  const fetchStamps = useStampStore((s) => s.fetchStamps)

  useEffect(() => {
    void fetchProjects()
    void fetchStamps()
  }, [fetchProjects, fetchStamps])

  return <DesktopShell />
}
