import { app, globalShortcut } from 'electron'
import { electronApp } from '@electron-toolkit/utils'
import { initDatabase } from './database'
import { registerAllHandlers } from './ipc'
import { createTray } from './tray'
import { createPanelWindow, togglePanelWindow, togglePanelWindowAtDefault, openDesktopWindow } from './window'

app.dock?.hide()

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.driftlog.app')

  initDatabase()
  registerAllHandlers()

  const panel = createPanelWindow()
  const tray = createTray(() => togglePanelWindow(tray))
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    togglePanelWindowAtDefault()
  })

  globalShortcut.register('CommandOrControl+Shift+O', () => {
    openDesktopWindow()
  })

  panel.on('ready-to-show', () => {
    // Window created but hidden — user clicks tray to show
  })
})

app.on('window-all-closed', () => {
  // Menu bar app: keep running even if window is closed
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
