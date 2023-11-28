import { Roles } from '@renderer/lib/langchain'
import { createStore, produce } from 'solid-js/store'
import { ulid } from 'ulid'

interface Msg {
  id: string
  role: Roles
  content: string
}
const [msgs, setMsgs] = createStore<Array<Msg>>([])

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

export function pushGeneratingStatus() {
  const id = ulid()
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

export { msgs, setMsgs, msgStatus }
