import { ElectronAPI } from '@electron-toolkit/preload'
import { api } from '../main/api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof api
  }
}
