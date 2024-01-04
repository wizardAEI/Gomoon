import { app } from 'electron'
import { join } from 'path'

export function getResourcesPath(filename: string): string {
  return app.isPackaged
    ? join(process.resourcesPath, '/app.asar.unpacked/resources/' + filename)
    : join(__dirname, '../../resources/', filename)
}

export const quitApp = {
  shouldQuit: false,
  quit() {
    this.shouldQuit = true
  },
  reset() {
    this.shouldQuit = false
  }
}
