import { createStore } from 'solid-js/store'
import { ModelsType, UserData } from 'src/main/model/model'

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

export function setSelectedAssistantForAns(assistant: string) {
  window.api.setSelectedAssistantForAns(assistant).then(() => {
    setUserData('selectedAssistantForAns', assistant)
  })
}

export function setSelectedAssistantForChat(assistant: string) {
  window.api.setSelectedAssistantForChat(assistant).then(() => {
    setUserData('selectedAssistantForChat', assistant)
  })
}

export { userData }
