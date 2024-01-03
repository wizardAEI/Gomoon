import { app } from 'electron'
import { join } from 'path'
import { embedding2 } from './ai/embedding/embedding2'

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

embedding2('')
