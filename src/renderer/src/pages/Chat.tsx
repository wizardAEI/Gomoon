import Input from '@renderer/components/Input'
import {
  msgs,
  pushMsg,
  editMsgByAdd,
  pushGeneratingStatus,
  removeGeneratingStatus,
  msgStatus,
  editMsg,
  reActiveGeneratingStatus
} from '../store/msgs'
import { frontendHelper } from '../lib/langchain'
import Message from '@renderer/components/Message'
import { For, Show, createSignal, onCleanup, onMount } from 'solid-js'
import { ulid } from 'ulid'
import { event } from '@renderer/lib/util'
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
  const [text, setText] = createSignal('')
  const [editId, setEditId] = createSignal('')
  const genMsg = (id: string) => {
    const currentMsgs = msgs.slice(
      0,
      msgs.findIndex((msg) => msg.id === id)
    )
    console.log(currentMsgs.length)
    frontendHelper(currentMsgs, {
      newTokenCallback(content: string) {
        editMsgByAdd(content, id)
      },
      endCallback() {
        removeGeneratingStatus(id)
      },
      errorCallback(err) {
        if ((err = 'Request timed out.')) {
          editMsgByAdd('\n\n回答超时，请重试', id)
        } else {
          editMsgByAdd('\n\n出问题了: ', err)
        }
        removeGeneratingStatus(id)
      }
    })
  }
  onMount(() => {
    requestAnimationFrame(() => {
      const chatContainer = document.querySelector('.chat-container')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
    const reGenMsg = (id: string) => {
      reActiveGeneratingStatus(id)
      editMsg({ content: '' }, id)
      genMsg(id)
    }
    event.on('reGenMsg', reGenMsg)
    const editUserMsg = (c: string, id: string) => {
      setEditId(id)
      editMsg({ content: '' }, id)
      setText(c)
    }
    event.on('editUserMsg', editUserMsg)

    onCleanup(() => {
      event.off('reGenMsg', reGenMsg)
      event.off('editUserMsg', editUserMsg)
    })
  })

  return (
    <div class="chat-container flex h-full flex-col overflow-auto pb-24 pt-6">
      {msgs.length === 0 && (
        <div class="mt-4 cursor-pointer">
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
                id={msg.id}
                class={'flex ' + (msg.role === 'human' ? 'human ml-4 justify-end' : 'ai mr-4')}
              >
                <Message content="......" type={msg.role} botName="前端专家" />
              </div>
            }
          >
            <div
              ref={(el) => scrollToBottom(el, index())}
              class={`relative flex max-w-[calc(100%-16px)] ${
                msg.role === 'human' ? 'human ml-4 justify-end' : 'ai mr-4'
              }`}
            >
              <Message id={msg.id} content={msg.content} type={msg.role} botName="前端专家" />
            </div>
          </Show>
        )}
      </For>
      <div class="fixed bottom-10 z-50 w-full px-4">
        <Input
          text={text()}
          setText={setText}
          showClearButton
          send={async (v: string) => {
            if (editId()) {
              // 重新编辑某一条消息
              editMsg({ content: text() }, editId())
              if (msgs.find((msg) => msg.id === editId())?.role === 'ai') {
                return
              }
              const id = msgs[msgs.findIndex((msg) => msg.id === editId()) + 1]?.id
              editMsg({ content: '' }, id)
              genMsg(id)
              setEditId('')
            } else {
              // 发送新消息
              pushMsg({
                role: 'human',
                content: v,
                id: ulid()
              })
              const id = pushGeneratingStatus()
              if (msgs.at(-1)?.role === 'human') {
                pushMsg({
                  role: 'ai',
                  content: '',
                  id
                })
              }
              genMsg(id)
            }
          }}
          // 自动聚焦
          onMountHandler={(inputDiv: HTMLTextAreaElement) => {
            inputDiv.focus()
          }}
          // 显示时自动聚焦
          autoFocusWhenShow
          isGenerating={msgStatus.generatingList.length > 0}
        />
      </div>
    </div>
  )
}
