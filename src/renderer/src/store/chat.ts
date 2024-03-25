import { ErrorDict } from '@renderer/lib/constant'
import { Roles, chatAssistant } from '@renderer/lib/ai/langchain'
import { createStore, produce } from 'solid-js/store'
import { ulid } from 'ulid'
import { addHistory } from './history'
import { cloneDeep } from 'lodash'
import { assistants, getCurrentAssistantForChat } from './assistants'
import { extractMeta } from '@renderer/lib/ai/parseString'
import { consumedToken, setConsumedTokenForChat } from './input'
import { userData } from './user'
export interface Msg {
  id: string
  role: Roles
  content: string
}
const [msgs, setMsgs] = createStore<Array<Msg>>([])

let trash: {
  msgs: Array<Msg>
  consumedToken: number
} = {
  msgs: [],
  consumedToken: 0
}

function initTrash() {
  trash = {
    msgs: [],
    consumedToken: 0
  }
}

const abortMap = new Map<string, (ans?: string) => void>()

export function pushMsg(msg: Msg) {
  initTrash()
  setMsgs(
    produce((msgs) => {
      msgs.push(msg)
    })
  )
}

export function clearMsgs() {
  trash = {
    msgs: cloneDeep(msgs),
    consumedToken: consumedToken().chat
  }
  setMsgs([])
  setConsumedTokenForChat(0)
}

export function restoreMsgs() {
  if (!trash.consumedToken) return
  setMsgs(trash.msgs)
  setConsumedTokenForChat(trash.consumedToken)
  initTrash()
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

export function isGenerating(id: string) {
  return msgStatus.generatingList.includes(id)
}

export function reActiveGeneratingStatus(id: string) {
  setMsgStatus(
    produce((msgStatus) => {
      msgStatus.generatingList.push(id)
    })
  )
}

export async function genMsg(id: string) {
  const currentMsgs = msgs.slice(
    0,
    msgs.findIndex((msg) => msg.id === id)
  )
  const controller = new AbortController()
  abortMap.set(id, () => controller.abort())
  try {
    await chatAssistant(
      currentMsgs.map((m, i) => ({
        ...m,
        content: extractMeta(m.content, i === currentMsgs.length - 1)
      })),
      {
        newTokenCallback(content: string) {
          editMsgByAdd(content, id)
        },
        endCallback(res) {
          let consumedToken = res.llmOutput?.estimatedTokenUsage?.totalTokens ?? 0
          !consumedToken && (consumedToken = res.llmOutput?.tokenUsage?.totalTokens)
          !consumedToken && (consumedToken = 0)
          setConsumedTokenForChat(consumedToken)
          removeGeneratingStatus(id)
        },
        errorCallback(err: Error) {
          editMsgByAdd(ErrorDict(err), id)
          removeGeneratingStatus(id)
        },
        pauseSignal: controller.signal
      }
    )
  } catch (err) {
    if (!isGenerating(id)) return
    editMsgByAdd(ErrorDict(err as Error), id)
    abortMap.delete(id)
  }
}

export async function stopGenMsg(id: string) {
  abortMap.get(id)?.()
  abortMap.delete(id)

  // 自行计算token消费
  const currentMsgs = msgs.reduce((acc, msg) => {
    acc += msg.content
    return acc
  }, '')
  const systemContent = assistants.find(
    (assistant) => assistant.id === userData.selectedAssistantForChat
  )?.prompt
  setConsumedTokenForChat(await window.api.getTokenNum(systemContent + currentMsgs))
}

export async function saveMsgsBeforeID(id: string) {
  const index = msgs.findIndex((msg) => msg.id === id)
  if (index === -1) return
  const currentMsgs = msgs.slice(0, index + 1)
  return addHistory({
    id: ulid(),
    assistantId: getCurrentAssistantForChat()?.id,
    type: 'chat',
    contents: currentMsgs
  })
}

export { msgs, setMsgs, msgStatus }
