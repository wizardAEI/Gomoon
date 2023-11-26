import { spawn } from 'child_process'
import { BrowserWindow, clipboard, globalShortcut, ipcMain } from 'electron'
import { join } from 'path'

export default function mainWindowHandler(app: Electron.App, mainWindow: BrowserWindow) {
  if (!app.isReady()) {
    console.error('app is not ready')
    return
  }
  if (!mainWindow) {
    console.error('mainWindow is not ready')
    return
  }

  const events = new Events(mainWindow)
  /**
   * FEAT: 按键监听
   */
  globalShortcut.register('CmdOrCtrl+B', () => {
    mainWindow?.isVisible() ? events['hide-window']() : events['show-window']()
  })

  // macos TODO: 测试不同版本的macos
  if (process.platform === 'darwin') {
    const eventTracker = spawn(join(__dirname, '../../resources/eventTracker'))
    eventTracker.stdout.on('data', (data) => {
      if (`${data}` === 'multi-copy') {
        events['multi-copy']()
      }
    })
  } else {
    // windows TODO: 未测试
    const eventTracker = spawn(join(__dirname, '../../resources/eventTracker'))
    eventTracker.stdout.on('data', (data) => {
      if (`${data}` === 'multi-copy') {
        events['multi-copy']()
      }
    })
  }

  /**
   * FEAT: render -> main
   */
  ipcMain.handle('set-is-on-top', (_, isOnTop: boolean) => {
    mainWindow.setAlwaysOnTop(isOnTop, 'status')
    return mainWindow.isAlwaysOnTop()
  })
}
export class Events {
  window: BrowserWindow
  constructor(window: BrowserWindow) {
    this.window = window
  }
  'hide-window' = () => this.window.hide()
  'show-window' = () => {
    this.window.webContents.send('show-window')
    this.window.show()
  }
  'multi-copy' = () => {
    const window = this.window
    const copyText = clipboard.readText()
    console.info(copyText)
    window.webContents.send('multi-copy', copyText)
    window.webContents.send('show-window')
    window.show()
  }
}
