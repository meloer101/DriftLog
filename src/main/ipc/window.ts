import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc-channels'
import { getPanelWindow, openDesktopWindow } from '../window'

export function registerWindowHandlers(): void {
  ipcMain.handle(IPC.WINDOW.HIDE, () => {
    const panel = getPanelWindow()
    panel?.hide()
    return true
  })

  ipcMain.handle(IPC.WINDOW.OPEN_DESKTOP, () => {
    openDesktopWindow()
    return true
  })
}
