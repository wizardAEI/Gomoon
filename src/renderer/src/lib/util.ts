import { Models } from 'src/lib/langchain'

// 消息中心 （发布订阅）
// eslint-disable-next-line @typescript-eslint/ban-types
const Events = new Map<string, Set<Function>>()

export type Events = {
  reGenMsg: (id: string) => void // 告知 Chat 页面重新生成答案
  editUserMsg: (content: string, id: string) => void // 告知 Chat 页面修改用户的信息
  updateModels: (newModels: Models) => void // 告知修改模型信息
  stopSpeak: () => void // 告知页面停止说话
}
export const event = {
  on<T extends keyof Events>(event: T, callback: Events[T]) {
    if (!Events.has(event)) {
      Events.set(event, new Set())
    }
    Events.get(event)!.add(callback)
  },
  off<T extends keyof Events>(event: T, callback: Events[T]) {
    if (Events.has(event)) {
      Events.get(event)!.delete(callback)
    }
  },
  emit<T extends keyof Events>(event: T, ...args: Parameters<Events[T]>) {
    if (Events.has(event)) {
      for (const callback of Events.get(event)!) {
        callback(...args)
      }
    }
  }
}

export const getSystem: () => 'mac' | 'linux' | 'win' = () => {
  const ua = navigator.userAgent
  if (ua.match(/windows/i)) {
    return 'win'
  }
  if (ua.match(/mac/i)) {
    return 'mac'
  }
  return 'linux'
}

export const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}
