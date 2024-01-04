import { app, BrowserWindow, Menu, globalShortcut } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initAppEventsHandler } from './eventHandler'
import { createWindow, showWindow } from './window'
import { quitApp } from './lib'
import { embedding } from './lib/ai/embedding/embedding'

// dock
app.dock?.setIcon(icon)
app.dock?.setMenu(Menu.buildFromTemplate([]))

// 检测只启动一个app
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 如果获取锁失败，说明已经有一个实例在运行了，可以直接退出
  app.quit()
} else {
  app.on('second-instance', () => {
    // 当运行第二个实例时，将会聚焦到 myWindow 这个窗口
    showWindow()
  })
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.Gomoon')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  initAppEventsHandler()
  createWindow()
  embedding('Hello world')

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
  quitApp.quit()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})
