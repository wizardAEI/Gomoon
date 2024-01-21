import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import MemoryFragment, {
  AssistantModel,
  CreateAssistantModel,
  HistoryModel,
  Line,
  MemoModel,
  UserDataModel
} from '../main/models/model'
import { SettingModel } from "../lib/langchain"
import { FileLoaderRes } from '../main/lib/ai/fileLoader'
import { EditFragmentOption } from '../main/lib/ai/embedding/index'

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
  },
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  setIsOnTop: (isOnTop: boolean) => ipcRenderer.invoke('set-is-on-top', isOnTop),

  // 配置相关
  loadConfig: () => ipcRenderer.invoke('load-config'),
  setConfig: () => ipcRenderer.invoke('set-config'),
  setModels: (models: SettingModel['models']) => ipcRenderer.invoke('set-models', models),
  setCanMultiCopy: (b: boolean) => ipcRenderer.invoke('set-can-multi-copy', b),
  setQuicklyWakeUpKeys: (keys: string) => ipcRenderer.invoke('set-quickly-wake-up-keys', keys),
  setSendWithCmdOrCtrl: (b: boolean) => ipcRenderer.invoke('set-send-with-cmd-or-ctrl', b),

  // 用户信息相关
  getUserData: (): Promise<UserDataModel> => ipcRenderer.invoke('get-user-data'),
  setUserData: (userData: Partial<UserDataModel>) => ipcRenderer.invoke('set-user-data', userData),

  // assistant 相关
  getAssistants: (): Promise<AssistantModel[]> => ipcRenderer.invoke('get-assistants'),
  updateAssistant: (assistant: AssistantModel) => ipcRenderer.invoke('update-assistant', assistant),
  deleteAssistant: (assistantId: string) => ipcRenderer.invoke('delete-assistant', assistantId),
  createAssistant: (assistant: CreateAssistantModel): Promise<AssistantModel> =>
    ipcRenderer.invoke('create-assistant', assistant),
  useAssistant: (assistantId: string) => ipcRenderer.invoke('use-assistant', assistantId),

  // history 相关
  getHistories: (): Promise<HistoryModel[]> => ipcRenderer.invoke('get-histories'),
  addHistory: (history: HistoryModel) => ipcRenderer.invoke('add-history', history),
  deleteHistory: (historyId: string) => ipcRenderer.invoke('delete-history', historyId),

  // memory 相关
  getMemories: (): Promise<MemoModel[]> => ipcRenderer.invoke('get-memories'),
  editFragment: (
    option: EditFragmentOption
  ): Promise<{
    suc: boolean
    reason?: string
  }> => ipcRenderer.invoke('edit-memory', option),

  // 文件相关
  parseFile: (
    files: {
      path: string
      type: string
    }[]
  ): Promise<FileLoaderRes> => ipcRenderer.invoke('parse-file', files),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  saveFile: (fileName: string, content: string) =>
    ipcRenderer.invoke('save-file', fileName, content),
  embedding: () => ipcRenderer.invoke('embedding'),
  getTokenNum: (text: string): Promise<number> => ipcRenderer.invoke('get-token-num', text),

  // 更新
  checkUpdate: (): Promise<boolean> => ipcRenderer.invoke('check-update'),
  quitForUpdate: () => ipcRenderer.invoke('quit-for-update'),
  downloadUpdate: (): Promise<string[]> => ipcRenderer.invoke('download-update'),

  // 其他
  getLines: (): Promise<Partial<Line>[]> => ipcRenderer.invoke('get-lines'),
  parsePageToString: (url: string): Promise<string> =>
    ipcRenderer.invoke('parse-page-to-string', url),
  receiveMsg: (callback: (event: IpcRendererEvent, msg: string) => Promise<void>) => {
    ipcRenderer.on('post-message', callback)
    return () => {
      ipcRenderer.removeListener('post-message', callback)
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
