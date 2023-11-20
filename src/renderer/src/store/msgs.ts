import { Roles } from '@renderer/lib/langchain'
import { createSignal, createRoot } from 'solid-js'

function createMessages() {
  const [msgs, setMsgs] = createSignal<
    Array<{
      role: Roles
      content: string
    }>
  >([])
  return {
    msgs,
    pushMsg: (msg: { role: Roles; content: string }) => setMsgs((msgs) => msgs.concat(msg)),
    clearMsgs: () => setMsgs([]),
    // TODO: 验证是否更新
    setMsg: (msg: { role: Roles; content: string }, index: number) => {
      setMsgs((msgs) => {
        msgs[index] = msg
        return msgs
      })
    }
  }
}

export default createRoot(createMessages)
