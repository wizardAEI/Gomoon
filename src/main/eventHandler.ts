import { spawn } from 'child_process'
import { BrowserWindow, app, clipboard, globalShortcut, ipcMain } from 'electron'
import { join } from 'path'
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
  setCanQuicklyWakeUp,
  setIsOnTop,
  setModels,
  setSendWithCmdOrCtrl,
  updateAssistant,
  updateUserData,
  useAssistant
} from './model/index'
import { mainWindow } from '.'
import { CreateAssistantModel, HistoryModel, ModelsType, UpdateAssistantModel } from './model/model'
import { getResourcesPath } from './lib'
export let handlerStatus = {}
export function initAppEventsHandler() {
  /**
   * FEAT: 按键监听
   */
  globalShortcut.register('CmdOrCtrl+G', () => {
    if (mainWindow?.isVisible()) {
      mainWindow?.hide()
      return
    }
    mainWindow?.webContents.send('show-window')
    mainWindow?.show()
  })
  // macos TODO: 测试不同版本的macos
  if (process.platform === 'darwin') {
    const eventTracker = spawn(getResourcesPath('eventTracker'))
    eventTracker.stdout.on('data', (data) => {
      if (`${data}` === 'multi-copy') {
        const copyText = clipboard.readText()
        mainWindow?.webContents.send('multi-copy', copyText)
        mainWindow?.webContents.send('show-window')
        mainWindow?.show()
      }
      // 应用程序退出时，关闭子进程
      app.on('will-quit', () => {
        eventTracker.kill()
      })
    })
  } else {
    // windows TODO: 未测试
    const eventTracker = app.isPackaged
      ? spawn(join(process.resourcesPath, 'app.asar.unpacked/resources/eventTracker'))
      : spawn(join(__dirname, '../../resources/eventTracker'))
    eventTracker.stdout.on('data', (data) => {
      if (`${data}` === 'multi-copy') {
        const copyText = clipboard.readText()
        mainWindow?.webContents.send('multi-copy', copyText)
        mainWindow?.webContents.send('show-window')
        mainWindow?.show()
        mainWindow?.focus()
      }
    })
    // 应用程序退出时，关闭子进程
    app.on('will-quit', () => {
      eventTracker.kill()
    })
  }

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
  ipcMain.handle('get-event-handler-status', () => handlerStatus)
  ipcMain.handle('set-can-multi-copy', (_, canMultiCopy: boolean) => setCanMultiCopy(canMultiCopy))
  ipcMain.handle('set-can-quickly-wake-up', (_, keys: string) => setCanQuicklyWakeUp(keys))
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

  app.on('browser-window-created', () => {
    mainWindow?.webContents.send('get-event-handler-status', handlerStatus)
  })
}
