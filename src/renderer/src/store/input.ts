import { createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { userData } from './user'

interface InputStore {
  isNetworking: boolean
  inputText?: string
}

const [inputStore, setInputStore] = createStore<InputStore>({
  isNetworking: false,
  inputText: ''
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

export function setInputText(text: string) {
  setInputStore('inputText', text)
}

export const inputText = createMemo(() => {
  return inputStore.inputText
})
