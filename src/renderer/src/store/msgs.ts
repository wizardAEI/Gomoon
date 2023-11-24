import { Roles } from '@renderer/lib/langchain'
import { createStore, produce } from 'solid-js/store'

const [msgs, setMsgs] = createStore<
  Array<{
    role: Roles
    content: string
  }>
>([])

export function pushMsg(msg: { role: Roles; content: string }) {
  setMsgs(
    produce((msgs) => {
      msgs.push(msg)
    })
  )
}

export function clearMsgs() {
  setMsgs([])
}

export function editMsg(msg: { role: Roles; content: string }, index: number) {
  setMsgs(
    produce((msgs) => {
      msgs[index] = msg
    })
  )
}

export function editMsgByAdd(content: string, index: number) {
  setMsgs(
    produce((msgs) => {
      msgs[index].content += content
    })
  )
}

const [msgStatus, setMsgStatus] = createStore({
  isGenerating: false
})

export function setGeneratingStatus(status: boolean) {
  setMsgStatus(
    produce((msgStatus) => {
      msgStatus.isGenerating = status
    })
  )
}

export { msgs, setMsgs, msgStatus }
