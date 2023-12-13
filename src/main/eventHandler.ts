import { BrowserWindow, app, ipcMain } from 'electron'
import {
  addHistory,
  createAssistant,
  deleteAssistant,
  deleteHistory,
  getAssistants,
  getHistories,
  getUserData,
  loadUserConfig,
  setCanMultiCopy,
  setQuicklyWakeUpKeys,
  setIsOnTop,
  setModels,
  setSendWithCmdOrCtrl,
  updateAssistant,
  updateUserData,
  useAssistant
} from './model/index'
import { CreateAssistantModel, HistoryModel, ModelsType, UpdateAssistantModel } from './model/model'
import { setQuicklyWakeUp } from './window'

export function initAppEventsHandler() {
  /**
   * FEAT: 配置相关(特指配置页的信息)
   */
  ipcMain.handle('load-config', () => {
    return loadUserConfig()
  })
  ipcMain.handle('set-is-on-top', (e, isOnTop: boolean) => {
    const mainWindow = BrowserWindow.fromWebContents(e.sender)
    mainWindow!.setAlwaysOnTop(isOnTop, 'status')
    setIsOnTop(isOnTop)
    return mainWindow!.isAlwaysOnTop()
  })
  ipcMain.handle('set-models', (_, models: any) => setModels(models))
  ipcMain.handle('set-can-multi-copy', (_, canMultiCopy: boolean) => {
    console.log('set-can-multi-copy', canMultiCopy)
    setCanMultiCopy(canMultiCopy)
  })

  ipcMain.handle('set-quickly-wake-up-keys', (_, keys: string) => {
    console.log('set-quickly-wake-up-keys', keys)
    setQuicklyWakeUpKeys(keys)
    setQuicklyWakeUp(keys)
  })
  ipcMain.handle('set-send-with-cmd-or-ctrl', (_, b: boolean) => setSendWithCmdOrCtrl(b))

  /**
   * FEAT: 用户相关
   */
  ipcMain.handle('have-used', () => updateUserData({ firstTime: false }))
  ipcMain.handle('set-selected-model', (_, selectedModel: ModelsType) =>
    updateUserData({ selectedModel })
  )
  ipcMain.handle('set-selected-assistant-for-chat', (_, id: string) =>
    updateUserData({
      selectedAssistantForChat: id
    })
  )
  ipcMain.handle('set-selected-assistant-for-ans', (_, id: string) =>
    updateUserData({
      selectedAssistantForAns: id
    })
  )
  ipcMain.handle('get-user-data', () => getUserData())

  /**
   * FEAT: assistant 相关
   */
  ipcMain.handle('get-assistants', () => getAssistants())
  ipcMain.handle('update-assistant', (_, a: UpdateAssistantModel) => updateAssistant(a))
  ipcMain.handle('delete-assistant', (_, id: string) => deleteAssistant(id))
  ipcMain.handle('create-assistant', (_, a: CreateAssistantModel) => createAssistant(a))
  ipcMain.handle('use-assistant', (_, id: string) => useAssistant(id))

  /**
   * FEAT: history 相关
   */
  ipcMain.handle('get-histories', () => getHistories())
  ipcMain.handle('add-history', (_, history: HistoryModel) => addHistory(history))
  ipcMain.handle('delete-history', (_, id: string) => deleteHistory(id))

  app.on('browser-window-created', () => {})
}
