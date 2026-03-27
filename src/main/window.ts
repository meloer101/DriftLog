import { BrowserWindow, Tray, screen, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { WINDOW_WIDTH, WINDOW_MAX_HEIGHT } from '../shared/constants'

let panelWindow: BrowserWindow | null = null
let desktopWindow: BrowserWindow | null = null

export function createPanelWindow(): BrowserWindow {
  panelWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_MAX_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  panelWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  panelWindow.on('blur', () => {
    hidePanelWindow()
  })

  panelWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    panelWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    panelWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return panelWindow
}

export function togglePanelWindow(tray: Tray): void {
  if (!panelWindow) return

  if (panelWindow.isVisible()) {
    hidePanelWindow()
  } else {
    showPanelWindow(tray)
  }
}

export function togglePanelWindowAtDefault(): void {
  if (!panelWindow) return

  if (panelWindow.isVisible()) {
    hidePanelWindow()
  } else {
    showPanelWindowAtDefault()
  }
}

function showPanelWindow(tray: Tray): void {
  if (!panelWindow) return

  const trayBounds = tray.getBounds()
  const windowBounds = panelWindow.getBounds()

  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  panelWindow.setPosition(x, y)
  panelWindow.show()
}

function showPanelWindowAtDefault(): void {
  if (!panelWindow) return

  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const windowBounds = panelWindow.getBounds()
  const x = Math.round(workArea.x + workArea.width - windowBounds.width - 8)
  const y = Math.round(workArea.y + 8)

  panelWindow.setPosition(x, y)
  panelWindow.show()
}

function hidePanelWindow(): void {
  if (!panelWindow) return
  panelWindow.hide()
}

export function getPanelWindow(): BrowserWindow | null {
  return panelWindow
}

export function createDesktopWindow(): BrowserWindow {
  desktopWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  desktopWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  desktopWindow.on('closed', () => {
    desktopWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    desktopWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/desktop.html`)
  } else {
    desktopWindow.loadFile(join(__dirname, '../renderer/desktop.html'))
  }

  desktopWindow.once('ready-to-show', () => {
    desktopWindow?.show()
  })

  return desktopWindow
}

export function openDesktopWindow(): void {
  if (desktopWindow && !desktopWindow.isDestroyed()) {
    desktopWindow.focus()
  } else {
    createDesktopWindow()
  }
}

export function getDesktopWindow(): BrowserWindow | null {
  return desktopWindow
}
