import { BrowserWindow, clipboard } from 'electron'

export const eventHandler = {
  'show-window': (window: BrowserWindow) => {
    window.webContents.send('show-window')
    window.show()
  },
  'multi-copy': (window: BrowserWindow) => {
    const copyText = clipboard.readText()
    console.log(copyText)
    window.webContents.send('multi-copy', copyText)
    window.webContents.send('show-window')
    window.show()
  }
} as const
