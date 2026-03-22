import { Tray, nativeImage } from 'electron'
import { join } from 'path'

let tray: Tray | null = null

export function createTray(onClick: () => void): Tray {
  const iconPath = join(__dirname, '../../resources/iconTemplate.png')
  let icon: Electron.NativeImage

  try {
    icon = nativeImage.createFromPath(iconPath)
  } catch {
    icon = nativeImage.createEmpty()
  }

  if (icon.isEmpty()) {
    icon = nativeImage.createFromBuffer(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAAMRJREFUOBFj' +
          'YBhowEgbBv7//88MxExAbATEjEDMBMT/gfg/ED8E4ntAfBeI7wDxXSC+B5IAYjYgZgViNqgY' +
          'UOwBEN8F4v9QzAzFLFAxi5CQkP9lZWX/gQqYoQqZoYqYoYrAgJmZmQFoCANQjBmqiBkqDwYs' +
          'UMIClGBhZmYB0ixQMRaoGBjAlDEzMzMD5VmhYqxQMTBggRIsQMzCzMwCpFmgYixQMRaoGBiw' +
          'QAkWIGZhZmYB0ixQMRaoGMUAAG3wTBPMh+PTAAAAAElFTkSuQmCC',
        'base64'
      )
    )
    icon = icon.resize({ width: 18, height: 18 })
  }

  icon.setTemplateImage(true)

  tray = new Tray(icon)
  tray.setToolTip('DriftLog')
  tray.on('click', onClick)

  return tray
}

export function getTray(): Tray | null {
  return tray
}
