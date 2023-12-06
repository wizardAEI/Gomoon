import { app } from 'electron'
import { JSONSyncPreset } from 'lowdb/node'
import { SettingModel, getDefaultConfig, getDefaultUserData } from './model'
import { join } from 'path'

const appDataPath = app.getPath('userData')
const configDB = JSONSyncPreset(join(appDataPath, 'config.json'), getDefaultConfig())

/**
 * FEAT: 配置相关(特指配置页的信息)
 */
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

/**
 * FEAT: 用户数据相关
 */
const userDataDB = JSONSyncPreset(join(appDataPath, 'user-data.json'), getDefaultUserData())
export function getUserData() {
  return userDataDB.data
}
export function updateUserData(data: Partial<typeof userDataDB.data>) {
  userDataDB.data = {
    ...userDataDB.data,
    ...data
  }
  userDataDB.write()
}
