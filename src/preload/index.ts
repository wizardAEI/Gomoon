import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
export const api = {
  multiCopy: (callback: (event: IpcRendererEvent, msg: string) => void) => {
    ipcRenderer.on('multi-copy', callback)
    return () => {
      ipcRenderer.removeListener('multi-copy', callback)
    }
  },
  showWindow: (callback: (event: IpcRendererEvent) => void) => {
    ipcRenderer.on('show-window', callback)
    return () => {
      ipcRenderer.removeListener('show-window', callback)
    }
  }
} as const

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
