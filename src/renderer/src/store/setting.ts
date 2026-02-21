import { createStore, produce, unwrap } from 'solid-js/store'
import { isEqual, cloneDeep } from 'lodash'
import { event, getSystem } from '@renderer/lib/util'
import { defaultModels } from '@lib/langchain'
import type { ModelsConfig, Provider, EnabledModel } from '@lib/models-config'
import { createMemo } from 'solid-js'
import { SettingFontFamily, SettingModel } from 'src/main/models/model'
import { ulid } from 'ulid'

const [settingStore, setSettingStore] = createStore<
  {
    isLoaded: boolean
    oldModels: ModelsConfig
  } & SettingModel
>({
  isOnTop: false,
  isLoaded: false,
  models: defaultModels(),
  oldModels: defaultModels(),
  quicklyAnsKey: 'C',
  quicklyWakeUpKeys: '',
  sendWithCmdOrCtrl: false,
  theme: 'gomoon-theme',
  chatFontSize: 14,
  fontFamily: 'default',
  openAtLogin: false
})

export function setIsOnTop(v: boolean) {
  setSettingStore('isOnTop', v)
  return window.api.setIsOnTop(v as boolean)
}

export function setQuicklyAnsKey(v: string) {
  setSettingStore('quicklyAnsKey', v)
  return window.api.setQuicklyAnsKey(v)
}

export function setQuicklyWakeUpKeys(v: string) {
  setSettingStore('quicklyWakeUpKeys', v)
  return window.api.setQuicklyWakeUpKeys(v)
}

export function setSendWithCmdOrCtrl(v: boolean) {
  setSettingStore('sendWithCmdOrCtrl', v)
  return window.api.setSendWithCmdOrCtrl(v)
}

export async function setTheme(theme: string) {
  setSettingStore('theme', theme)
  return window.api.setTheme(theme)
}

export async function setFontFamily(fontFamily: SettingFontFamily) {
  setSettingStore('fontFamily', fontFamily)
  return window.api.setChatFontFamily(fontFamily)
}

export async function setOpenAtLogin(v: boolean) {
  setSettingStore('openAtLogin', v)
  return window.api.setOpenAtLogin(v)
}

export async function loadConfig() {
  const config = await window.api.loadConfig()
  setSettingStore('isOnTop', config.isOnTop)
  // 直接用服务端配置覆盖，避免 merge 对数组按索引合并导致已保存的 providers/enabledModels 丢失
  const models = cloneDeep(config.models)
  setSettingStore('models', models)
  setSettingStore('oldModels', cloneDeep(config.models))
  setSettingStore('quicklyAnsKey', config.quicklyAnsKey)
  setSettingStore('quicklyWakeUpKeys', config.quicklyWakeUpKeys)
  setSettingStore('sendWithCmdOrCtrl', config.sendWithCmdOrCtrl)
  setSettingStore('isLoaded', true)
  setSettingStore('theme', config.theme)
  setSettingStore('chatFontSize', config.chatFontSize)
  setSettingStore('fontFamily', config.fontFamily)
  setSettingStore('openAtLogin', config.openAtLogin)
  event.emit('updateModels', config.models)
}

export function addProvider(provider: Omit<Provider, 'id'>) {
  const p: Provider = { ...provider, id: ulid() }
  setSettingStore('models', 'providers', (prev) => [...prev, p])
  updateModelsToFile()
}

export function updateProvider(id: string, updates: Partial<Omit<Provider, 'id'>>) {
  setSettingStore(
    'models',
    'providers',
    produce((providers) => {
      const idx = providers.findIndex((p) => p.id === id)
      if (idx >= 0) Object.assign(providers[idx], updates)
    })
  )
  updateModelsToFile()
}

export function removeProvider(id: string) {
  setSettingStore('models', 'providers', (prev) => prev.filter((p) => p.id !== id))
  setSettingStore('models', 'enabledModels', (prev) => prev.filter((em) => em.providerId !== id))
  updateModelsToFile()
}

export function addEnabledModel(em: Omit<EnabledModel, 'id'>) {
  const m: EnabledModel = { ...em, id: ulid() }
  setSettingStore('models', 'enabledModels', (prev) => [...prev, m])
  updateModelsToFile()
}

export function updateEnabledModel(id: string, updates: Partial<Omit<EnabledModel, 'id'>>) {
  setSettingStore(
    'models',
    'enabledModels',
    produce((ems) => {
      const idx = ems.findIndex((e) => e.id === id)
      if (idx >= 0) Object.assign(ems[idx], updates)
    })
  )
  updateModelsToFile()
}

export function removeEnabledModel(id: string) {
  setSettingStore('models', 'enabledModels', (prev) => prev.filter((e) => e.id !== id))
  updateModelsToFile()
}

export async function updateModelsToFile() {
  const config = unwrap(settingStore)
  if (isEqual(config.models, config.oldModels)) return
  await window.api.setModels(config.models)
  loadConfig()
}

export async function setChatFontSize(v: number) {
  setSettingStore('chatFontSize', v)
  return window.api.setChatFontSize(v)
}

export { settingStore, setSettingStore }

export interface UpdaterStore {
  updateStatus: {
    canUpdate: boolean
    haveDownloaded: boolean
    updateProgress: number
    version: string
  }
}

const [updaterStore, setUpdaterStore] = createStore<UpdaterStore>({
  updateStatus: {
    canUpdate: false,
    haveDownloaded: false,
    updateProgress: 0,
    version: ''
  }
})
export function setUpdaterStatus(status: Partial<UpdaterStore['updateStatus']>) {
  setUpdaterStore(
    produce((s) => {
      s.updateStatus = {
        ...s.updateStatus,
        ...status
      }
    })
  )
}

export const updateStatusLabel = createMemo(() => {
  const dict: Record<string, string> = {
    canUpdate: '有新版本,点击下载！',
    updateProgress:
      '下载中: ' + updaterStore.updateStatus.updateProgress + '%（请不要中途退出应用）',
    haveDownloaded: getSystem() === 'mac' ? '下载完成，请手动安装' : '新版本下载完成,立即安装！'
  }
  let label = '检查更新'
  for (const key in dict) {
    if (updaterStore.updateStatus[key as keyof typeof updaterStore.updateStatus]) {
      label = dict[key]
    }
  }
  return label
})

export async function updateVersion() {
  if (updaterStore.updateStatus.haveDownloaded) {
    if (getSystem() === 'mac') {
      return true
    }
    window.api.quitForUpdate()
    return true
  }
  if (
    updaterStore.updateStatus.updateProgress > 0 &&
    updaterStore.updateStatus.updateProgress < 100
  ) {
    return true
  }
  if (updaterStore.updateStatus.canUpdate) {
    setUpdaterStatus({ updateProgress: 1 })
    window.api.downloadUpdate().then((res) => {
      if (res.length) {
        setUpdaterStatus({ haveDownloaded: true })
      }
    })
    return true
  }
  const res = await window.api.checkUpdate()
  if (res) {
    setUpdaterStatus({ canUpdate: true })
  } else {
    return false
  }
  return true
}

export { updaterStore as systemStore }
