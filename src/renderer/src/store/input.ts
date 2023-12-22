import { createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { userData } from './user'

interface InputStore {
  isNetworking: boolean
}

const [inputStore, setInputStore] = createStore<InputStore>({
  isNetworking: false
})

export function setNetworkingStatus(status: boolean) {
  setInputStore('isNetworking', status)
}

export const isNetworking = createMemo(() => {
  if (userData.selectedModel === 'ERNIE3' || userData.selectedModel === 'ERNIE4') {
    return false
  }
  return inputStore.isNetworking
})
