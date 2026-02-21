/// <reference types="vite/client" />

declare module '*?asset' {
  const url: string
  export default url
}

import { ElectronAPI } from '@electron-toolkit/preload'
import { api as Api } from '../../preload/index'
declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof Api
  }
  type Tesseract = typeof import('tesseract.js')
}
