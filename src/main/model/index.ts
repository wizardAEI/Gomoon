import { app } from 'electron'
import { JSONSyncPreset } from 'lowdb/node'
import { SettingModel, getDefaultConfig } from './model'
import { join } from 'path'

const appDataPath = app.getPath('userData')
const configDB = JSONSyncPreset(join(appDataPath, 'config.json'), getDefaultConfig())

export function loadUserConfig() {
  return configDB.data
}

export function setUserConfig(config: Partial<SettingModel>) {
  configDB.data = {
    ...configDB.data,
    ...config
  }
  configDB.write()
}

export function setIsOnTop(isOnTop: SettingModel['isOnTop']) {
  configDB.data = {
    ...configDB.data,
    isOnTop
  }
  configDB.write()
}

export function setModels(models: SettingModel['models']) {
  configDB.data = {
    ...configDB.data,
    models: {
      ...configDB.data.models,
      ...models
    }
  }
  configDB.write()
}
