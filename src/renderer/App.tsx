import { useUIStore } from './stores/use-ui-store'
import { PanelShell } from './components/layout/PanelShell'
import { ProjectList } from './components/projects/ProjectList'
import { CreateProjectForm } from './components/projects/CreateProjectForm'
import { StampLibrary } from './components/stamps/StampLibrary'
import { CreateStampForm } from './components/stamps/CreateStampForm'

function ViewContent() {
  const view = useUIStore((s) => s.view)

  switch (view) {
    case 'projects':
      return <ProjectList />
    case 'create-project':
      return <CreateProjectForm />
    case 'stamps':
      return <StampLibrary />
    case 'create-stamp':
      return <CreateStampForm />
    default:
      return <ProjectList />
  }
}

export default function App() {
  return (
    <PanelShell>
      <ViewContent />
    </PanelShell>
  )
}
