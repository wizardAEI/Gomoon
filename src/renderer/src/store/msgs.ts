import { ErrorDict } from '@renderer/lib/constant'
import { Roles, chatAssistant } from '@renderer/lib/ai/langchain'
import { createStore, produce } from 'solid-js/store'
import { ulid } from 'ulid'

interface Msg {
  id: string
  role: Roles
  content: string
}
const [msgs, setMsgs] = createStore<Array<Msg>>([])

const abortMap = new Map<string, (ans?: string) => void>()

export function pushMsg(msg: Msg) {
  setMsgs(
    produce((msgs) => {
      msgs.push(msg)
    })
  )
}

export function clearMsgs() {
  setMsgs([])
}

export function editMsg(msg: Partial<Msg>, id: string) {
  setMsgs(
    produce((msgs) => {
      const index = msgs.findIndex((item) => item.id === id)
      msgs[index] = { ...msgs[index], ...msg }
    })
  )
}

export function editMsgByAdd(content: string, id: string) {
  setMsgs(
    produce((msgs) => {
      const index = msgs.findIndex((item) => item.id === id)
      msgs[index].content += content
    })
  )
}

const [msgStatus, setMsgStatus] = createStore<{
  generatingList: string[]
}>({
  generatingList: []
})

export function pushGeneratingStatus(existID?: string) {
  const id = existID || ulid()
  setMsgStatus(
    produce((msgStatus) => {
      msgStatus.generatingList.push(id)
    })
  )
  return id
}

export function removeGeneratingStatus(id: string) {
  setMsgStatus(
    produce((msgStatus) => {
      msgStatus.generatingList = msgStatus.generatingList.filter((item) => item !== id)
    })
  )
}

export function reActiveGeneratingStatus(id: string) {
  setMsgStatus(
    produce((msgStatus) => {
      msgStatus.generatingList.push(id)
    })
  )
}

export function genMsg(id: string) {
  const currentMsgs = msgs.slice(
    0,
    msgs.findIndex((msg) => msg.id === id)
  )
  const controller = new AbortController()
  chatAssistant(currentMsgs, {
    newTokenCallback(content: string) {
      editMsgByAdd(content, id)
    },
    endCallback() {
      removeGeneratingStatus(id)
    },
    errorCallback(err: Error) {
      if (ErrorDict[err.message]) {
        editMsgByAdd(ErrorDict[err.message], id)
      } else {
        editMsgByAdd(`\n\n出问题了:${err.name}: ${err.message}`, id)
      }
      removeGeneratingStatus(id)
    },
    pauseSignal: controller.signal
  })
  abortMap.set(id, () => controller.abort())
}

export function stopGenMsg(id: string) {
  abortMap.get(id)?.()
  abortMap.delete(id)
  removeGeneratingStatus(id)
}

export { msgs, setMsgs, msgStatus }
