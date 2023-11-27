import Input from '@renderer/components/ui/Input'
import { msgs, pushMsg, editMsgByAdd, setGeneratingStatus, msgStatus } from '../store/msgs'
import { frontendHelper } from '../lib/langchain'
import Message from '@renderer/components/ui/Message'
import { For, Show, onMount } from 'solid-js'

const scrollToBottom = (el: HTMLDivElement, index: number) => {
  if (index === msgs.length - 1) {
    requestAnimationFrame(() => {
      el.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      })
    })
  }
}

export default function Chat() {
  onMount(() => {
    requestAnimationFrame(() => {
      const chatContainer = document.querySelector('.chat-container')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
  })
  return (
    <div class="chat-container flex h-full flex-col overflow-auto pb-24">
      {msgs.length === 0 && (
        <div class="mt-10 cursor-pointer">
          <Message content={'前端助手'} type="system" />
        </div>
      )}
      <For each={msgs}>
        {(msg, index) => (
          // 这里使用三元表达式来显示消息时会有渲染不及时的问题
          <Show
            when={msg.content}
            fallback={
              <div
                ref={(el) => scrollToBottom(el, index())}
                class={'flex ' + (msg.role === 'human' ? 'human ml-4 justify-end' : 'ai mr-4')}
              >
                <Message content="......" type={msg.role} botName="前端专家" />
              </div>
            }
          >
            <div
              ref={(el) => scrollToBottom(el, index())}
              class={
                (msg.role === 'human' ? 'human ml-4 justify-end' : 'ai mr-4') +
                ' flex max-w-[calc(100%-16px)]'
              }
            >
              <Message content={msg.content} type={msg.role} botName="前端专家" />
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
            if (msgs.at(-1)?.role === 'human') {
              pushMsg({
                role: 'ai',
                content: ''
              })
            }
            const index = msgs.length - 1
            setGeneratingStatus(true)
            frontendHelper(
              msgs,
              (content: string) => {
                editMsgByAdd(content, index)
              },
              () => {
                setGeneratingStatus(false)
              }
            )
          }}
          // 自动聚焦
          onMountHandler={(inputDiv: HTMLTextAreaElement) => {
            inputDiv.focus()
          }}
          // 显示时自动聚焦
          autoFocusWhenShow
          isGenerating={msgStatus.isGenerating}
        />
      </div>
    </div>
  )
}
