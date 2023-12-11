import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  AssistantModel,
  CreateAssistantModel,
  HistoryModel,
  ModelsType,
  SettingModel,
  UpdateAssistantModel,
  UserData
} from '../main/model/model'
import { handlerStatus } from '../main/eventHandler'

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
  setIsOnTop: (isOnTop: boolean) => ipcRenderer.invoke('set-is-on-top', isOnTop),

  // 配置相关
  loadConfig: () => ipcRenderer.invoke('load-config'),
  setConfig: () => ipcRenderer.invoke('set-config'),
  setModels: (models: SettingModel['models']) => ipcRenderer.invoke('set-models', models),
  getEventHandlerStatus: (): Promise<typeof handlerStatus> =>
    ipcRenderer.invoke('get-event-handler-status'),

  // 用户信息相关
  getUserData: (): Promise<UserData> => ipcRenderer.invoke('get-user-data'),
  setSelectedModel: (selectedModel: ModelsType) =>
    ipcRenderer.invoke('set-selected-model', selectedModel),
  haveUsed: () => ipcRenderer.invoke('have-used'),
  setSelectedAssistantForChat: (assistantId: string) =>
    ipcRenderer.invoke('set-selected-assistant-for-chat', assistantId),
  setSelectedAssistantForAns: (assistantId: string) =>
    ipcRenderer.invoke('set-selected-assistant-for-ans', assistantId),

  // assistant 相关
  getAssistants: (): Promise<AssistantModel[]> => ipcRenderer.invoke('get-assistants'),
  updateAssistant: (assistant: UpdateAssistantModel) =>
    ipcRenderer.invoke('update-assistant', assistant),
  deleteAssistant: (assistantId: string) => ipcRenderer.invoke('delete-assistant', assistantId),
  createAssistant: (assistant: CreateAssistantModel): Promise<AssistantModel> =>
    ipcRenderer.invoke('create-assistant', assistant),
  useAssistant: (assistantId: string) => ipcRenderer.invoke('use-assistant', assistantId),

  // history 相关
  getHistories: (): Promise<HistoryModel[]> => ipcRenderer.invoke('get-histories'),
  addHistory: (history: HistoryModel) => ipcRenderer.invoke('add-history', history),
  deleteHistory: (historyId: string) => ipcRenderer.invoke('delete-history', historyId)
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
