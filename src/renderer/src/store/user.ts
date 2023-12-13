import { createStore } from 'solid-js/store'
import { ModelsType, UserDataModel } from 'src/main/model/model'
import { useAssistant } from './assistants'

const [userData, setUserData] = createStore<UserDataModel>({
  firstTime: true,
  selectedModel: 'GPT4',
  selectedAssistantForAns: '',
  selectedAssistantForChat: '',
  firstTimeFor: {
    modelSelect: true,
    assistantSelect: true
  }
})

export async function loadUserData() {
  setUserData(await window.api.getUserData())
  console.log(userData.firstTimeFor)
}

export function userHasUse() {
  window.api.setUserData({
    firstTime: false
  })
}

export function setSelectedModel(model: ModelsType) {
  window.api
    .setUserData({
      selectedModel: model
    })
    .then(() => {
      setUserData('selectedModel', model)
    })
}

export async function setSelectedAssistantForAns(assistantID: string) {
  setUserData('selectedAssistantForAns', assistantID)
  await useAssistant(assistantID)
  return window.api.setUserData({
    selectedAssistantForAns: assistantID
  })
}

export async function setSelectedAssistantForChat(assistantID: string) {
  setUserData('selectedAssistantForChat', assistantID)
  await useAssistant(assistantID)
  return window.api.setUserData({
    selectedAssistantForChat: assistantID
  })
}

export async function hasFirstTimeFor(key: keyof UserDataModel['firstTimeFor']) {
  setUserData('firstTimeFor', {
    ...userData.firstTimeFor,
    [key]: false
  })
  await window.api.setUserData({
    firstTimeFor: {
      [key]: false
    }
  })
  loadUserData()
}

export { userData }
