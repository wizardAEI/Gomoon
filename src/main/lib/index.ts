import { join } from 'path'
import { writeFile } from 'fs'

import { app, dialog } from 'electron'

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
export async function saveFile(fileName: string, content: string | Buffer) {
  const res = await dialog.showSaveDialog({
    title: '保存文件',
    buttonLabel: '保存',
    defaultPath: fileName,
    filters: [
      {
        name: 'All Files',
        extensions: ['*']
      }
    ]
  })
  if (res.filePath) {
    writeFile(res.filePath, content, () => {})
  }
}
