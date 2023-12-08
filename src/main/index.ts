import { app, shell, BrowserWindow, Tray, Menu, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import trayIcon from '../../resources/icon@20.png?asset'
import { loadUserConfig } from './model'
import { initAppEventsHandler } from './eventHandler'

// tray
let tray: Tray | null = null

// main window
export let mainWindow: BrowserWindow | null = null

// quit Control
let willQuitApp = false

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Gomoon',
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
    !app.isPackaged && mainWindow!.webContents.openDevTools()
  })

  // 点击关闭时隐藏窗口而不是退出
  mainWindow.on('close', (event) => {
    if (!willQuitApp) {
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
  tray.setToolTip('Gomoon')
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

// dock
app.dock.setIcon(icon)
app.dock.setMenu(Menu.buildFromTemplate([]))

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  initAppEventsHandler()
  createWindow()

  // preConfig
  mainWindow!.setAlwaysOnTop(loadUserConfig().isOnTop, 'status')

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // FEAT: CORS
  const filter = {
    urls: ['https://aip.baidubce.com/*', 'https://api.chatanywhere.com.cn/*'] // Remote API URS for which you are getting CORS error,
  }
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
    if (event.url.includes('localhost')) {
      return
    }
    event.preventDefault()
    shell.openExternal(event.url)
  })
})

app.on('before-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
  willQuitApp = true
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
