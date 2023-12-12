import { app } from 'electron'
import { JSONSyncPreset } from 'lowdb/node'
import {
  AssistantModel,
  CreateAssistantModel,
  HistoryModel,
  SettingModel,
  UpdateAssistantModel
} from './model'
import { getDefaultUserData } from './default/getDefaultUserData'
import { getDefaultConfig } from './default/getDefaultConfig'
import { join } from 'path'
import { ulid } from 'ulid'
import { merge } from 'lodash'
import getDefaultAssistants from './default/assistants'

const appDataPath = app.getPath('userData')
const configDB = JSONSyncPreset(join(appDataPath, 'config.json'), getDefaultConfig())

/**
 * FEAT: 配置相关(特指配置页的信息)
 */
export function loadUserConfig() {
  return merge(getDefaultConfig(), configDB.data)
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

export function setCanMultiCopy(canMultiCopy: SettingModel['canMultiCopy']) {
  configDB.data = {
    ...configDB.data,
    canMultiCopy
  }
  configDB.write()
}

export function setCanQuicklyWakeUp(canQuicklyWakeUp: SettingModel['canQuicklyWakeUp']) {
  configDB.data = {
    ...configDB.data,
    canQuicklyWakeUp
  }
  configDB.write()
}

export function setSendWithCmdOrCtrl(sendWithCmdOrCtrl: SettingModel['sendWithCmdOrCtrl']) {
  configDB.data = {
    ...configDB.data,
    sendWithCmdOrCtrl
  }
  configDB.write()
}

/**
 * FEAT: 用户数据相关
 */
const userDataDB = JSONSyncPreset(join(appDataPath, 'user-data.json'), getDefaultUserData())
export function getUserData() {
  return merge(getDefaultUserData(), userDataDB.data)
}
export function updateUserData(data: Partial<typeof userDataDB.data>) {
  userDataDB.data = {
    ...userDataDB.data,
    ...data
  }
  userDataDB.write()
}

/**
 * FEAT: assistants 相关
 */
const assistantsDB = JSONSyncPreset(join(appDataPath, 'assistants.json'), getDefaultAssistants())
export function getAssistants() {
  return assistantsDB.data || []
}
export function updateAssistant(a: UpdateAssistantModel) {
  const index = assistantsDB.data.findIndex((item) => item.id === a.id)
  if (index === -1) {
    assistantsDB.data = [
      ...assistantsDB.data,
      {
        ...a,
        version: 1,
        id: ulid()
      }
    ]
  } else {
    assistantsDB.data[index] = {
      ...a,
      version: assistantsDB.data[index].version + 1
    }
  }
  assistantsDB.write()
}

export function deleteAssistant(id: string) {
  const index = assistantsDB.data.findIndex((item) => item.id === id)
  if (index === -1) {
    return
  }
  assistantsDB.data.splice(index, 1)
  assistantsDB.write()
}

export function createAssistant(a: CreateAssistantModel): AssistantModel {
  const newA = {
    ...a,
    id: ulid(),
    version: 1
  }
  assistantsDB.data.unshift(newA)
  assistantsDB.write()
  return newA
}

// 用过一个assistant后将其提到最前面
export function useAssistant(id: string) {
  const index = assistantsDB.data.findIndex((item) => item.id === id)
  if (index === -1) {
    return
  }
  const item = assistantsDB.data[index]
  assistantsDB.data.splice(index, 1)
  assistantsDB.data.unshift(item)
  assistantsDB.write()
}

/**
 * Histories 相关
 */
const historiesDB = JSONSyncPreset<HistoryModel[]>(join(appDataPath, 'histories.json'), [])

export function getHistories() {
  return historiesDB.data || []
}

export function addHistory(h: HistoryModel) {
  historiesDB.data.unshift(h)
  historiesDB.write()
}

export function deleteHistory(id: string) {
  const index = historiesDB.data.findIndex((item) => item.id === id)
  if (index === -1) {
    return
  }
  historiesDB.data.splice(index, 1)
  historiesDB.write()
}
