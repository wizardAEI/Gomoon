import { join } from 'path'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'

import robot from 'robotjs'
import {
  app,
  shell,
  BrowserWindow,
  Tray,
  Menu,
  clipboard,
  globalShortcut,
  OnBeforeSendHeadersListenerDetails,
  BeforeSendResponse,
  session,
  nativeImage
} from 'electron'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { debounce } from 'lodash'

import icon from '../../resources/icon.png?asset'

import { getUserData, loadAppConfig, setWindowSize } from './models'
import { getResourcesPath, quitApp } from './lib'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let preKeys = ''
let eventTracker: ChildProcessWithoutNullStreams | null = null

export interface ShowWindowParams {
  text: string
}

export function setQuicklyWakeUp(keys: string) {
  /**
   * FEAT: 按键监听
   */
  globalShortcut.register(keys, () => {
    function showWindow() {
      const getSelected: () => Promise<ShowWindowParams> = () => {
        return new Promise((resolve) => {
          // 缓存之前的文案
          const lastText = clipboard.readText('clipboard')

          const lastFile = clipboard.read('NSFilenamesPboardType')

          const platform = process.platform

          // 执行复制动作
          if (platform === 'darwin') {
            robot.keyTap('c', 'command')
          } else {
            robot.keyTap('c', 'control')
          }
          setTimeout(() => {
            const text =
              lastText === (clipboard.readText('clipboard') || '')
                ? ''
                : clipboard.readText('clipboard')
            clipboard.writeText(lastText)
            if (lastFile) {
              clipboard.writeBuffer('NSFilenamesPboardType', Buffer.from(lastFile))
            }
            resolve({
              text
            })
          }, 100)
        })
      }
      if (eventTracker) {
        eventTracker.stdin.write('isDragged\n')
        eventTracker.stdout.once('data', (data) => {
          const isDragged = `${data}`.trim() === 'true'
          if (isDragged) {
            getSelected().then((res) => {
              mainWindow?.show()
              mainWindow?.webContents.send('show-window', res)
            })
          } else {
            mainWindow?.show()
            mainWindow?.webContents.send('show-window', {
              text: ''
            })
          }
        })
      } else {
        mainWindow?.show()
        mainWindow?.webContents.send('show-window', {
          text: ''
        })
      }
    }
    if (!mainWindow?.isVisible()) {
      showWindow()
    } else if (mainWindow?.isAlwaysOnTop()) {
      mainWindow?.hide()
    } else if (!mainWindow?.isFocused()) {
      showWindow()
    } else {
      mainWindow?.hide()
    }
  })
  preKeys && globalShortcut.unregister(preKeys)
  preKeys = keys
}

export function hideWindow() {
  mainWindow?.hide()
}

export function minimize() {
  mainWindow?.minimize()
}

export function maximize() {
  mainWindow?.maximize()
}

export function unmaximize() {
  mainWindow?.unmaximize()
}

export function isMaximized() {
  return mainWindow?.isMaximized() || false
}

export function showWindow() {
  mainWindow?.show()
}

const cors: {
  defaultURLs: string[]
  handler:
    | ((
        details: OnBeforeSendHeadersListenerDetails,
        callback: (beforeSendResponse: BeforeSendResponse) => void
      ) => void)
    | null
} = {
  defaultURLs: [
    'http://www.baidu.com/*',
    'https://www.baidu.com/*',
    'https://dashscope.aliyuncs.com/*',
    'https://aip.baidubce.com/*',
    'https://api.openai.com/*',
    'https://api.moonshot.cn/*',
    'https://generativelanguage.googleapis.com/*'
  ],
  handler: (details, callback) => {
    const { origin, host } = new URL(details.url)
    details.requestHeaders['Origin'] = origin
    details.requestHeaders['Host'] = host
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  }
}
type cspItem = 'default-src' | 'script-src' | 'style-src' | 'connect-src' | 'img-src' | 'worker-src'
function csp(items?: {
  [key in cspItem]?: string[]
}) {
  const defaultItem: {
    [key in cspItem]: string[]
  } = {
    'default-src': [],
    'script-src': ["'unsafe-eval'"],
    'style-src': ["'unsafe-inline'"],
    'connect-src': ['https:', 'http://www.baidu.com', 'data:'],
    'img-src': ['https:', 'http:', 'data:', 'blob:'],
    'worker-src': ['blob:']
  }
  let cspStr = ''
  function item2Str(item: string[] | undefined) {
    if (!item) {
      return ''
    }
    // 去除网址后的路径
    item = item.map((url) => {
      try {
        const { origin } = new URL(url)
        if (origin === 'null') return url
        return origin || url
      } catch (e) {
        return url
      }
    })
    return item.join(' ')
  }
  for (const item in defaultItem) {
    cspStr +=
      item +
      " 'self' " +
      item2Str(defaultItem[item as cspItem]) +
      ' ' +
      item2Str(items?.[item]) +
      '; '
  }
  return cspStr
}

export function updateSendHeaders(urls: string[] = []) {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: cors.defaultURLs.concat(urls.map((url) => (url.endsWith('/*') ? url : url + '/*'))) },
    cors.handler
  )
}
export function updateRespHeaders(
  urls: string[] = [],
  conf?: { cspItems?: { [key in cspItem]?: string[] } }
) {
  session.defaultSession.webRequest.onHeadersReceived(
    { urls: cors.defaultURLs.concat(urls.map((url) => (url.endsWith('/*') ? url : url + '/*'))) },
    (details, callback) => {
      if (details.responseHeaders) {
        details.responseHeaders['access-control-allow-origin']?.length
          ? (details.responseHeaders['access-control-allow-origin'] = ['*'])
          : (details.responseHeaders['Access-Control-Allow-Origin'] = ['*'])
        details.responseHeaders['access-control-allow-headers']?.length
          ? (details.responseHeaders['access-control-allow-headers'] = ['*'])
          : (details.responseHeaders['Access-Control-Allow-Headers'] = ['*'])
        details.responseHeaders['access-control-allow-methods']?.length
          ? (details.responseHeaders['access-control-allow-methods'] = ['*'])
          : (details.responseHeaders['Access-Control-Allow-Methods'] = ['*'])
        details.responseHeaders['Content-Security-Policy'] = [csp(conf?.cspItems)]
      }
      callback({ responseHeaders: details.responseHeaders })
    }
  )
}

export async function checkUpdate(): Promise<boolean> {
  const res = await autoUpdater.checkForUpdates()
  return (res && res.updateInfo.version !== app.getVersion()) || false
}

export async function postMsgToMainWindow(msg: string) {
  return mainWindow?.webContents.send('post-message', msg)
}

export async function PostBuffToMainWindow(buff: Buffer) {
  return mainWindow?.webContents.send('post-buf', buff)
}

export function createWindow(): void {
  const userConfig = loadAppConfig()
  const userData = getUserData()

  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Gomoon',
    width: userData.windowSize.width,
    height: userData.windowSize.height,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    titleBarStyle: 'hidden'
  })

  // preConfig
  mainWindow!.setAlwaysOnTop(userConfig.isOnTop, 'status')

  // 版本更新
  autoUpdater.forceDevUpdateConfig = true
  autoUpdater.autoDownload = false
  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('post-message', 'download-progress ' + progress.percent)
  })
  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('post-message', 'update-downloaded')
  })
  // NOTICE: 由于没有苹果开发者认证，没办法自动更新，这里只有windows才去检查
  process.platform === 'win32' &&
    autoUpdater.checkForUpdates().then((res) => {
      // 如果有新版本则通知：
      if (res && res.updateInfo.version !== app.getVersion()) {
        mainWindow?.on('show', () => {
          mainWindow?.webContents.send('post-message', 'update-available')
        })
      }
    })

  // FEAT: 链接跳转，自动打开浏览器
  mainWindow.webContents.on('will-frame-navigate', (event) => {
    if (event.url.includes('localhost')) {
      return
    }
    event.preventDefault()
    shell.openExternal(event.url)
  })

  let filename = 'eventTracker'
  if (process.platform === 'win32') {
    filename += '.exe'
  } else if (process.arch === 'x64') {
    filename = 'eventTracker_x64'
  }
  eventTracker = spawn(getResourcesPath(filename))
  eventTracker.stderr.on('data', (data) => {
    if (`${data}`.includes('Failed to enable access')) {
      console.log('Failed to enable access')
      mainWindow?.once('show', () => {
        mainWindow?.webContents.send('post-message', 'event-tracker-access-denied')
      })
    }
  })
  eventTracker.stdout.on('data', (data) => {
    // FEAT: 双击复制回答
    if (userConfig.canMultiCopy) {
      if (`${data}` === 'multi-copy' && mainWindow) {
        const copyText = clipboard.readText().trim()
        if (!copyText || !loadAppConfig().canMultiCopy) {
          return
        }
        mainWindow.webContents.send('multi-copy', copyText)
        if (process.platform === 'win32') {
          // FEAT: 兼容win使用show方法不会获取焦点的问题
          mainWindow.minimize()
        }
        mainWindow.show()
      }
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
    // Open the DevTools.
    !app.isPackaged && mainWindow!.webContents.openDevTools()
  })

  //FEAT: 快捷键
  setQuicklyWakeUp(userConfig.quicklyWakeUpKeys)

  // 点击关闭时隐藏窗口而不是退出
  mainWindow.on('close', (event) => {
    if (!quitApp.shouldQuit) {
      mainWindow?.hide()
      event.preventDefault()
    }
  })

  // tray
  let trayIcon = nativeImage.createFromPath(getResourcesPath('icon.png'))
  if (process.platform === 'darwin') {
    trayIcon = trayIcon.resize({ width: 22, height: 22 })
  } else {
    trayIcon = trayIcon.resize({ width: 24, height: 24 })
  }
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

  updateSendHeaders()
  updateRespHeaders()

  // FEAT: 窗口大小调整持久化
  const resizeThrottle = debounce(() => {
    const [width, height] = mainWindow?.getSize() || [480, 760]
    setWindowSize(width, height)
  }, 600)
  mainWindow.on('resize', () => {
    resizeThrottle()
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

export async function beforeQuitWindowHandler() {
  !eventTracker?.killed && eventTracker?.kill()
}
