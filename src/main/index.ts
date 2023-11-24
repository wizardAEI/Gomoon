import { app, shell, BrowserWindow, Tray, Menu, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import trayIcon from '../../resources/icon@16.png?asset'
import { spawn } from 'child_process'
import { eventHandler } from './eventHandler'

// 隐藏 macOS dock
if (process.platform === 'darwin') {
  app.dock.hide()
}

// tray
let tray: Tray | null = null

// main window
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: '🤖',
    width: 420,
    height: 650,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    titleBarStyle: 'hidden'
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
    // Open the DevTools.
    mainWindow!.webContents.openDevTools()
  })

  // 点击关闭时隐藏窗口而不是退出
  mainWindow.on('close', (event) => {
    if (mainWindow?.isVisible()) {
      mainWindow?.hide()
      event.preventDefault()
    }
  })

  // tray
  tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主界面',
      click: () => mainWindow?.show()
    },
    {
      label: '退出',
      click: () => {
        mainWindow?.destroy()
        app.quit()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip('ChatGPT Desktop')
  tray.on('click', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  /**
   * FEAT: 按键监听
   */
  globalShortcut.register('CmdOrCtrl+B', () => {
    eventHandler['show-window'](mainWindow!)
  })
  // macos TODO: 测试不同版本的macos
  if (process.platform === 'darwin') {
    const eventTracker = spawn(join(__dirname, '../../resources/eventTracker'))
    eventTracker.stdout.on('data', (data) => {
      if (`${data}` === 'multi-copy') {
        eventHandler['multi-copy'](mainWindow!)
      }
    })
  } else {
    // windows TODO: 未测试
    const eventTracker = spawn(join(__dirname, '../../resources/eventTracker'))
    eventTracker.stdout.on('data', (data) => {
      if (`${data}` === 'multi-copy') {
        eventHandler['multi-copy'](mainWindow!)
      }
    })
  }
  const filter = {
    urls: ['https://aip.baidubce.com/*', 'https://api.chatanywhere.com.cn/*'] // Remote API URS for which you are getting CORS error,
  }

  // FEAT: CORS
  mainWindow?.webContents.session.webRequest.onHeadersReceived(filter, (details, callback) => {
    if (details.responseHeaders) {
      details.responseHeaders['Access-Control-Allow-Origin'] = []
      details.responseHeaders['access-control-allow-origin'] = ['*']
      details.responseHeaders['access-control-allow-headers'] = ['*']
      details.responseHeaders['access-control-allow-methods'] = ['*']
      details.responseHeaders['access-control-allow-credentials'] = ['true']
    }
    callback({ responseHeaders: details.responseHeaders })
  })

  // FEAT: 链接跳转，自动打开浏览器
  mainWindow?.webContents.on('will-frame-navigate', (event) => {
    event.preventDefault()
    // @ts-ignore
    shell.openExternal(event.url)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})
