import { app, BrowserWindow, Menu } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import robot from 'robotjs'

import icon from '../../resources/icon.png?asset'

import { initAppEventsHandler } from './eventHandler'
import { createWindow, showWindow } from './window'
import { quitApp } from './lib'
import { activateTokenizer } from './lib/ai/embedding/embedding'

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

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', async (e) => {
  // Unregister all shortcuts.
  if (quitApp.shouldQuit) {
    return
  }
  e.preventDefault()
  await quitApp.quit()
  setTimeout(() => app.quit())
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 激活robot
// 初始化tokenizer
// 分出一个线程，防止阻塞主进程
setTimeout(() => {
  const pos = robot.getMousePos()
  robot.moveMouse(pos.x, pos.y)
  activateTokenizer()
})
