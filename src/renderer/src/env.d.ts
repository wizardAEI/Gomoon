/// <reference types="vite/client" />

import { ElectronAPI } from '@electron-toolkit/preload'
import { api as Api } from '../../preload/index'
declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof Api
  }
}
