import { createStore } from 'solid-js/store'
import { ModelsType, UserData } from 'src/main/model/model'

const [userData, setUserData] = createStore<UserData>({
  firstTime: true,
  selectedModel: 'GPT4'
})

export async function loadUserData() {
  return window.api.getUserData().then((data) => {
    setUserData('firstTime', data.firstTime)
    setUserData('selectedModel', data.selectedModel)
  })
}

export function userHasUse() {
  window.api.haveUsed()
}

export function setSelectedModel(model: ModelsType) {
  window.api.setSelectedModel(model).then(() => {
    console.log(model)
    setUserData('selectedModel', model)
  })
}

export { userData }
