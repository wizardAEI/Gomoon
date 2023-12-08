import { createStore, unwrap } from 'solid-js/store'
import { isEqual, merge, cloneDeep } from 'lodash'
import { event } from '@renderer/lib/util'
import { defaultModels } from '@renderer/lib/ai/models'
export interface Models {
  OpenAI: {
    apiKey: string
    baseURL: string
    temperature: number
  }
  BaiduWenxin: {
    apiKey: string
    secretKey: string
    temperature: number
  }
}

const [settingStore, setSettingStore] = createStore<{
  isOnTop: boolean
  isLoaded: boolean
  models: Models
  oldModels: Models
}>({
  isOnTop: false,
  isLoaded: false,
  models: defaultModels(),
  oldModels: defaultModels()
})

export function setIsOnTop(v: boolean) {
  setSettingStore('isOnTop', v)
  return window.api.setIsOnTop(v as boolean)
}

export async function loadConfig() {
  const config = await window.api.loadConfig()
  // 从 data 中读取配置
  setSettingStore('isOnTop', config.isOnTop)
  setSettingStore('models', config.models)
  setSettingStore('oldModels', cloneDeep(config.models))
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
}

export { settingStore, setSettingStore }
