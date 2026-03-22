import { registerStampHandlers } from './stamps'
import { registerProjectHandlers } from './projects'
import { registerProjectStampHandlers } from './project-stamps'
import { registerCommitHandlers } from './commits'

export function registerAllHandlers(): void {
  registerStampHandlers()
  registerProjectHandlers()
  registerProjectStampHandlers()
  registerCommitHandlers()
}
