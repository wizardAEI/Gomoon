import { createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { userData } from './user'
import { ModelsType } from 'src/main/models/model'

const modelDict: {
  [key in ModelsType]: { maxToken: number }
} = {
  ERNIE3: {
    maxToken: 11200
  },
  ERNIE4: {
    maxToken: 9600
  },
  GPT3: {
    maxToken: 16385
  },
  GPT4: {
    maxToken: 128000
  },
  QWenTurbo: {
    maxToken: 6000
  },
  QWenPlus: {
    maxToken: 30000
  },
  QWenMax: {
    maxToken: 6000
  }
}

interface InputStore {
  isNetworking: boolean
  inputText?: string
  consumedToken: number
}

const [inputStore, setInputStore] = createStore<InputStore>({
  isNetworking: false,
  inputText: '',
  consumedToken: 0
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
    consumedToken: (plusNum: number) => parseNum(inputStore.consumedToken + plusNum)
  }
})

export const consumedToken = createMemo(() => {
  return inputStore.consumedToken
})

export function setConsumedToken(token: number) {
  setInputStore('consumedToken', token)
}
