import { createStore, produce, unwrap } from 'solid-js/store'
import { isEqual, merge, cloneDeep } from 'lodash'
import { event } from '@renderer/lib/util'
import { defaultModels } from '@lib/langchain'
import { Models } from 'src/lib/langchain'
import { createMemo } from 'solid-js'
const [settingStore, setSettingStore] = createStore<{
  isOnTop: boolean
  isLoaded: boolean
  models: Models
  oldModels: Models
  canMultiCopy: boolean
  quicklyWakeUpKeys: string
  sendWithCmdOrCtrl: boolean
}>({
  isOnTop: false,
  isLoaded: false,
  models: defaultModels(),
  oldModels: defaultModels(),
  canMultiCopy: false,
  quicklyWakeUpKeys: '',
  sendWithCmdOrCtrl: false
})

export function setIsOnTop(v: boolean) {
  setSettingStore('isOnTop', v)
  return window.api.setIsOnTop(v as boolean)
}

export function setCanMultiCopy(v: boolean) {
  setSettingStore('canMultiCopy', v)
  return window.api.setCanMultiCopy(v)
}

export function setQuicklyWakeUpKeys(v: string) {
  setSettingStore('quicklyWakeUpKeys', v)
  return window.api.setQuicklyWakeUpKeys(v)
}

export function setSendWithCmdOrCtrl(v: boolean) {
  setSettingStore('sendWithCmdOrCtrl', v)
  return window.api.setSendWithCmdOrCtrl(v)
}

export async function loadConfig() {
  const config = await window.api.loadConfig()
  // 从 data 中读取配置
  setSettingStore('isOnTop', config.isOnTop)
  setSettingStore('models', config.models)
  setSettingStore('oldModels', cloneDeep(config.models))
  setSettingStore('canMultiCopy', config.canMultiCopy)
  setSettingStore('quicklyWakeUpKeys', config.quicklyWakeUpKeys)
  setSettingStore('sendWithCmdOrCtrl', config.sendWithCmdOrCtrl)
  setSettingStore('isLoaded', true)
  event.emit('updateModels', config.models)
}

export async function setModels(models: Models) {
  setSettingStore('models', merge(unwrap(settingStore.models), models))
}

export async function updateModelsToFile() {
  const config = unwrap(settingStore)
  if (isEqual(config.models, config.oldModels)) return
  await window.api.setModels(config.models)
  event.emit('updateModels', config.models)
  loadConfig()
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
  const dict = {
    canUpdate: '有新版本,点击下载！',
    updateProgress:
      '下载中: ' + updaterStore.updateStatus.updateProgress + '%（请不要中途退出应用）',
    haveDownloaded: '新版本下载完成,立即安装！'
  }
  let label = '检查更新'
  for (const key in dict) {
    if (updaterStore.updateStatus[key]) {
      label = dict[key]
    }
  }
  return label
})

export async function updateVersion() {
  if (updaterStore.updateStatus.haveDownloaded) {
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
