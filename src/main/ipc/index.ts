import { registerStampHandlers } from './stamps'
import { registerProjectHandlers } from './projects'
import { registerProjectStampHandlers } from './project-stamps'
import { registerCommitHandlers } from './commits'
import { registerWindowHandlers } from './window'

export function registerAllHandlers(): void {
  registerStampHandlers()
  registerProjectHandlers()
  registerProjectStampHandlers()
  registerCommitHandlers()
  registerWindowHandlers()
}
