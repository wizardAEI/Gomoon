import { createSignal, onMount } from 'solid-js'
import { SolidMarkdown } from 'solid-markdown'
import { frontendHelper, translator } from '../lib/langchain'
import msgsStore from '../store/msgs'
import { IpcRendererEvent } from 'electron'

export default function ChatBox() {
  const { pushMsg, msgs } = msgsStore
  const [ans, setAns] = createSignal('')
  return (
    <div>
      结果: {ans()}
      <Input
        button="翻译/分析报错"
        send={async (text: string) => {
          const res = await translator(text)
          setAns(res.content as string)
        }}
        onMountHandler={() =>
          (window.api as any).multiCopy(async (ev: IpcRendererEvent, msg: string) => {
            console.log(ev)
            const res = await translator(msg)
            setAns(res.content as string)
          })
        }
      />
      <Messages />
      <Input
        button="和前端大师对话"
        showClearButton
        send={async (text: string) => {
          pushMsg({
            role: 'human',
            content: text
          })
          // solid-js 的 signal 值更新是同步的
          const res = await frontendHelper(msgs())
          pushMsg({
            role: 'ai',
            content: res.content as string
          })
        }}
      />
    </div>
  )
}

export function Messages() {
  const { msgs } = msgsStore
  return (
    <div>
      {msgs().map((msg) => {
        return (
          <div>
            role: {msg.role}
            <SolidMarkdown children={msg.content} />
          </div>
        )
      })}
    </div>
  )
}

export function Input({
  send,
  button,
  onMountHandler,
  showClearButton = false
}: {
  send: (msg: string) => void
  button: string
  onMountHandler?: () => void
  showClearButton?: boolean
}) {
  const [text, setText] = createSignal('')
  const { clearMsgs } = msgsStore
  onMount(() => {
    onMountHandler?.()
  })
  return (
    <div>
      <input
        value={text()}
        onChange={(e) => {
          setText(e.currentTarget.value)
        }}
        onSubmit={(e) => {
          e.preventDefault()
          send(text())
          setText('')
        }}
      />
      <button
        onClick={() => {
          send(text())
          setText('')
        }}
      >
        {button}
      </button>
      {showClearButton && (
        <button
          onClick={() => {
            clearMsgs()
          }}
        >
          清空历史
        </button>
      )}
    </div>
  )
}
