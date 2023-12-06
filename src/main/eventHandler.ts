import { spawn } from 'child_process'
import { BrowserWindow, app, clipboard, globalShortcut, ipcMain } from 'electron'
import { join } from 'path'
import { getUserData, loadUserConfig, setIsOnTop, setModels, updateUserData } from './model/index'
import { mainWindow } from '.'
export let handlerStatus = {}
export function initAppEventsHandler() {
  /**
   * FEAT: 按键监听
   */
  globalShortcut.register('CmdOrCtrl+B', () => {
    if (mainWindow?.isVisible()) {
      mainWindow?.hide()
      return
    }
    mainWindow?.webContents.send('show-window')
    mainWindow?.show()
  })
  // macos TODO: 测试不同版本的macos
  if (process.platform === 'darwin') {
    const eventTracker = app.isPackaged
      ? spawn(join(process.resourcesPath, 'app.asar.unpacked/resources/eventTracker'))
      : spawn(join(__dirname, '../../resources/eventTracker'))
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
      }
    })
    // 应用程序退出时，关闭子进程
    app.on('will-quit', () => {
      eventTracker.kill()
    })
  }

  /**
   * FEAT: render -> main
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
  ipcMain.handle('set-models', (_, models: any) => {
    setModels(models)
  })
  ipcMain.handle('get-event-handler-status', () => {
    return handlerStatus
  })

  ipcMain.handle('have-used', () => {
    updateUserData({
      firstTime: false
    })
  })
  ipcMain.handle('get-user-data', () => {
    return getUserData()
  })

  app.on('browser-window-created', () => {
    mainWindow?.webContents.send('get-event-handler-status', handlerStatus)
  })
}
