import { createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { modelDict } from '@lib/langchain'

import { userData } from './user'

interface InputStore {
  isNetworking: boolean
  memoCapsule: boolean
  inputText?: string
  consumedToken: {
    ans: number
    chat: number
  }
}

const [inputStore, setInputStore] = createStore<InputStore>({
  isNetworking: false,
  memoCapsule: false,
  inputText: '',
  consumedToken: {
    ans: 0,
    chat: 0
  }
})

export function setNetworkingStatus(status: boolean) {
  setInputStore('isNetworking', status)
}

export const isNetworking = createMemo(() => {
  if (userData.selectedModel === 'ERNIE4') {
    return false
  }
  return inputStore.isNetworking
})

export const memoCapsule = createMemo(() => {
  return inputStore.memoCapsule
})

export function setMemoCapsule(status: boolean) {
  setInputStore('memoCapsule', status)
}

export function setInputText(text: string) {
  setInputStore('inputText', text)
}

export const inputText = createMemo(() => {
  return inputStore.inputText ?? ''
})

export const tokens = createMemo(() => {
  function parseNum(num: number) {
    if (num < 1000) {
      return num
    }
    return `${Math.floor(num / 1000)}k`
  }
  return {
    maxToken: parseNum(modelDict[userData.selectedModel].maxToken),
    consumedTokenForChat: (plusNum: number) => parseNum(inputStore.consumedToken.chat + plusNum),
    consumedTokenForAns: (plusNum: number) => parseNum(inputStore.consumedToken.ans + plusNum)
  }
})
export const consumedToken = createMemo(() => {
  return inputStore.consumedToken
})
export function setConsumedTokenForChat(token: number) {
  setInputStore('consumedToken', 'chat', token)
}
export function setConsumedTokenForAns(token: number) {
  setInputStore('consumedToken', 'ans', token)
}
