import Input from '@renderer/components/Input'
import { msgs, pushMsg, editMsgByAdd } from '../store/msgs'
import { frontendHelper } from '../lib/langchain'
import Message from '@renderer/components/Message'
import { For, Show } from 'solid-js'

export default function Chat() {
  return (
    <div class="h-screen overflow-auto pb-24">
      {msgs.length === 0 && (
        <div class="cursor-pointer pt-10">
          <Message content={'前端助手'} type="system" />
        </div>
      )}
      <For each={msgs}>
        {(msg) => (
          // 这里使用三元表达式来显示消息时会有渲染不及时的问题
          <Show
            when={msg.content}
            fallback={
              <div class="w-3/5">
                <Message content="..." type={msg.role} />
              </div>
            }
          >
            <div
              class={
                (msg.role === 'human' ? 'ml-4 justify-end' : 'mr-4') +
                ' flex max-w-[calc(100%-16px)]'
              }
            >
              <Message content={msg.content} type={msg.role} />
            </div>
          </Show>
        )}
      </For>
      <div class="fixed bottom-10 w-full px-4">
        <Input
          showClearButton
          send={async (text: string) => {
            pushMsg({
              role: 'human',
              content: text
            })
            pushMsg({
              role: 'ai',
              content: ''
            })
            frontendHelper(msgs, (content: string) => {
              editMsgByAdd(content, msgs.length - 1)
            })
          }}
          // 自动聚焦
          onMountHandler={(inputDiv: HTMLTextAreaElement) => {
            window.api.showWindow(() => {
              inputDiv.focus()
            })
          }}
        />
      </div>
    </div>
  )
}
