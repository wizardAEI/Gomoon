import { createStore } from 'solid-js/store'
import { ModelsType, UserData } from 'src/main/model/model'
import { useAssistant } from './assistants'

const [userData, setUserData] = createStore<UserData>({
  firstTime: true,
  selectedModel: 'GPT4',
  selectedAssistantForAns: '',
  selectedAssistantForChat: ''
})

export async function loadUserData() {
  setUserData(await window.api.getUserData())
}

export function userHasUse() {
  window.api.haveUsed()
}

export function setSelectedModel(model: ModelsType) {
  window.api.setSelectedModel(model).then(() => {
    setUserData('selectedModel', model)
  })
}

export async function setSelectedAssistantForAns(assistantID: string) {
  return window.api.setSelectedAssistantForAns(assistantID).then(() => {
    setUserData('selectedAssistantForAns', assistantID)
    useAssistant(assistantID)
  })
}

export async function setSelectedAssistantForChat(assistantID: string) {
  return window.api.setSelectedAssistantForChat(assistantID).then(() => {
    setUserData('selectedAssistantForChat', assistantID)
    useAssistant(assistantID)
  })
}

export { userData }
