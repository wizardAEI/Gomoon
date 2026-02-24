import { chmodSync, existsSync } from 'fs'
import { join } from 'path'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'

import { keyboard, Key } from '@nut-tree/nut-js'
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
  nativeImage,
  systemPreferences
} from 'electron'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { debounce } from 'lodash'

// @ts-ignore *.png?asset 在 node 由 electron-vite 声明；web typecheck 间接拉入本文件时无此声明
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

/** 打开 macOS 系统设置 - 隐私与安全性 - 辅助功能 */
export function openAccessibilityPane() {
  if (process.platform !== 'darwin') return
  shell.openExternal(
    'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility'
  )
}

/** macOS 是否从「应用转移」临时路径运行（如从 DMG 直接打开），权限无法持久 */
function isRunningTranslocated(): boolean {
  if (process.platform !== 'darwin' || !app.isPackaged) return false
  const path = process.execPath || app.getAppPath?.() || ''
  return path.includes('AppTranslocation')
}

export function setQuicklyAns(key: string) {
  !eventTracker?.killed && eventTracker?.kill()
  if (process.platform === 'darwin') {
    if (isRunningTranslocated()) {
      mainWindow?.webContents.send('post-message', 'event-tracker-translocated')
      return
    }
    const trusted = systemPreferences.isTrustedAccessibilityClient(false)
    if (!trusted) {
      openAccessibilityPane()
      mainWindow?.webContents.send('post-message', 'event-tracker-need-permission')
      return
    }
  }
  let filename = 'eventTracker'
  if (process.platform === 'win32') {
    filename += '.exe'
  } else if (process.arch === 'x64') {
    filename = 'eventTracker_x64'
  }
  const exePath = getResourcesPath(filename)
  if (app.isPackaged && process.platform !== 'win32' && existsSync(exePath)) {
    try {
      chmodSync(exePath, 0o755)
    } catch (_) {}
  }
  eventTracker = spawn(exePath, ['--key', key])
  eventTracker.on('error', (err) => {
    console.error('eventTracker spawn error:', err)
    mainWindow?.webContents.send('post-message', 'event-tracker-spawn-error')
  })
  eventTracker.stderr.on('data', (data) => {
    if (`${data}`.includes('Failed to enable access')) {
      console.log('Failed to enable access')
      if (process.platform === 'darwin') {
        if (isRunningTranslocated()) {
          mainWindow?.once('show', () => {
            mainWindow?.webContents.send('post-message', 'event-tracker-translocated')
          })
        } else {
          systemPreferences.isTrustedAccessibilityClient(true)
          openAccessibilityPane()
          mainWindow?.once('show', () => {
            mainWindow?.webContents.send('post-message', 'event-tracker-access-denied')
          })
        }
      } else {
        mainWindow?.once('show', () => {
          mainWindow?.webContents.send('post-message', 'event-tracker-access-denied')
        })
      }
    }
  })
  eventTracker.stdout.on('data', (data) => {
    // FEAT: 快速复制回答
    if (`${data}` === 'quickly-ans' && mainWindow) {
      const copyText = clipboard.readText().trim()
      if (!copyText) {
        return
      }
      mainWindow.webContents.send('quickly-ans', copyText)
      if (process.platform === 'win32') {
        // FEAT: 兼容win使用show方法不会获取焦点的问题
        mainWindow.minimize()
      }
      mainWindow.show()
    }
  })
}

export function setQuicklyWakeUp(keys: string) {
  /**
   * FEAT: 按键监听
   */
  globalShortcut.register(keys, () => {
    function showWindow() {
      const getSelected = async (): Promise<ShowWindowParams> => {
        // 缓存之前的文案
        const lastText = clipboard.readText('clipboard')
        const lastFile = clipboard.read('NSFilenamesPboardType')
        const lastImage = clipboard.readImage('clipboard')
        const platform = process.platform

        // 执行复制动作（模拟 Cmd+C / Ctrl+C）
        if (platform === 'darwin') {
          await keyboard.pressKey(Key.LeftSuper, Key.C)
          await keyboard.releaseKey(Key.LeftSuper, Key.C)
        } else {
          await keyboard.pressKey(Key.LeftControl, Key.C)
          await keyboard.releaseKey(Key.LeftControl, Key.C)
        }
        await new Promise((r) => setTimeout(r, 200))
        const text =
          lastText === (clipboard.readText('clipboard') || '')
            ? ''
            : clipboard.readText('clipboard')
        clipboard.writeText(lastText)
        clipboard.writeImage(lastImage)
        if (lastFile) {
          clipboard.writeBuffer('NSFilenamesPboardType', Buffer.from(lastFile))
        }
        return { text }
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
    'https://generativelanguage.googleapis.com/*',
    'https://galaxyapi.onrender.com/*',
    'https://api.anthropic.com/*'
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
  const isWin = process.platform === 'win32'
  mainWindow = new BrowserWindow({
    title: 'Gomoon',
    width: userData.windowSize.width,
    height: userData.windowSize.height,
    show: false,
    autoHideMenuBar: true,
    // FEAT: Windows 最小化后恢复时减少白屏：使用与主题接近的深色，避免未绘制时闪白
    ...(isWin ? { backgroundColor: '#1c1c1e' } : {}),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      // FEAT: Windows 在最小化时保持 renderer 不节流，避免恢复时状态不同步导致卡死/白屏
      ...(isWin ? { backgroundThrottling: false } : {})
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

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
    // Open the DevTools.
    !app.isPackaged && mainWindow!.webContents.openDevTools()
  })

  // FEAT: Windows 从最小化恢复时通知渲染进程强制重绘，缓解白屏/卡死
  if (isWin) {
    mainWindow.on('show', () => {
      mainWindow?.webContents.send('window-restored')
    })
  }

  //FEAT: 快捷键
  setQuicklyAns(userConfig.quicklyAnsKey)
  setQuicklyWakeUp(userConfig.quicklyWakeUpKeys)

  // 点击关闭时隐藏窗口而不是退出
  mainWindow.on('close', (event) => {
    if (!quitApp.shouldQuit) {
      console.log('xxxxx')
      mainWindow?.hide()
      event.preventDefault()
    }
  })
  app.on('activate', (_) => {
    mainWindow?.show()
    mainWindow?.webContents.send('show-window', {
      text: ''
    })
  })

  // tray
  let trayIcon = nativeImage.createFromPath(getResourcesPath('tray.png'))
  if (process.platform === 'darwin') {
    trayIcon = trayIcon.resize({ width: 18, height: 18 })
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
