import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels'
import { getPanelWindow } from '../window'

export function registerWindowHandlers(): void {
  ipcMain.handle(IPC.WINDOW.HIDE, () => {
    const panel = getPanelWindow()
    panel?.hide()
    return true
  })
}
