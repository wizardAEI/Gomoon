import { createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { ModelsType } from '@lib/langchain'

import { userData } from './user'

const modelDict: {
  [key in ModelsType]: { maxToken: number }
} = {
  ERNIE3: {
    maxToken: 11200
  },
  ERNIE4: {
    maxToken: 9600
  },
  ERNIE128K: {
    maxToken: 128000
  },
  GPT3: {
    maxToken: 16385
  },
  GPT4: {
    maxToken: 128000
  },
  GPTCustom: {
    maxToken: 0
  },
  QWenTurbo: {
    maxToken: 6000
  },
  QWenPlus: {
    maxToken: 30000
  },
  QWenMax: {
    maxToken: 6000
  },
  GeminiPro: {
    maxToken: 30720
  },
  Moonshot128k: {
    maxToken: 128000
  },
  Moonshot8k: {
    maxToken: 8000
  },
  Moonshot32k: {
    maxToken: 32000
  },
  Llama: {
    maxToken: 0
  },
  Ollama: {
    maxToken: 0
  }
}

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
