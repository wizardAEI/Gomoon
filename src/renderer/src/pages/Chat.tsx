import Input from '@renderer/components/MainInput'
import Message from '@renderer/components/Message'
import { For, Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { ulid } from 'ulid'
import { event } from '@renderer/lib/util'
import { getCurrentAssistantForChat } from '@renderer/store/assistants'
import SystemHeader from '@renderer/components/MainSelections'
import Capsule from '@renderer/components/Capsule'
import { currentLines } from '@renderer/store/user'
import { inputText, setInputText } from '@renderer/store/input'
import { useToast } from '@renderer/components/ui/Toast'
import { useEventListener } from 'solidjs-use'

import {
  msgs,
  pushMsg,
  pushGeneratingStatus,
  msgStatus,
  editMsg,
  reActiveGeneratingStatus,
  genMsg,
  removeMsg,
  restoreMsgs
} from '../store/chat'
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
  const toast = useToast()
  // FEAT: 打字机效果
  const [linesContent, setLinesContent] = createSignal('')
  const [linesFrom, setLinesFrom] = createSignal('')
  // onMount 由于可能还没 load 完数据，导致没有 lines，所以使用 createEffect
  createEffect((b) => {
    if (!currentLines().length || b) return
    const index = Math.floor(Math.random() * currentLines().length)
    const linesFull = (currentLines()[index]?.content ?? '') + ' — '
    setLinesContent(linesFull.slice(0, 1))
    // 打字机效果,逐渐显示introduce
    const timer = setInterval(() => {
      if (linesFull.length <= linesContent().length) {
        clearInterval(timer)
        setLinesFrom(currentLines()[index]?.from ?? '')
      } else {
        setLinesContent((i) => {
          return i + linesFull[i.length]
        })
      }
    }, 70)
    return true
  }, false)

  // FEAT: 记录用户点击编辑后如果没有发送，则取消编辑
  const [previousMsg, setPreviousMsg] = createSignal<{
    content: string
    id: string
    state: 'pending' | 'complete'
  }>({ content: '', id: '', state: 'complete' })
  const [editId, setEditId] = createSignal('')
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
      if (previousMsg().state !== 'complete') {
        editMsg({ content: previousMsg().content }, previousMsg().id)
      }
      setEditId(id)
      if (!id) {
        setInputText('')
        setPreviousMsg({ content: '', id, state: 'complete' })
        return
      }
      editMsg({ content: '' }, id)
      setInputText(c)
      setPreviousMsg({ content: c, id, state: 'pending' })
    }
    event.on('editUserMsg', editUserMsg)

    onCleanup(() => {
      if (previousMsg().state !== 'complete') {
        editMsg({ content: previousMsg().content }, previousMsg().id)
      }
      event.off('reGenMsg', reGenMsg)
      event.off('editUserMsg', editUserMsg)
    })
  })

  let cleanupForRestoreMsgs: (() => void) | undefined
  function handleRemoveMsg(id: string) {
    removeMsg(id)
    toast.info(`${navigator.userAgent.includes('Mac') ? 'command' : 'ctrl'} + z 撤销`, {
      duration: 1000,
      position: 'top-3/4'
    })
    cleanupForRestoreMsgs?.()
    cleanupForRestoreMsgs = useEventListener(document, 'keydown', (e) => {
      if ((e.key === 'z' && e.ctrlKey) || (e.key === 'z' && e.metaKey)) {
        restoreMsgs()
        cleanupForRestoreMsgs?.()
      }
    })
  }

  return (
    <div class="chat-container relative flex h-[calc(100vh-124px)] flex-col overflow-auto pb-24 pt-10">
      <Show
        when={msgs.length}
        fallback={
          <>
            {
              <div class="flex w-full select-none flex-col items-center justify-center gap-2 px-10 pt-8">
                <span class="text-sm text-text3">Gomoon</span>
                <span class="text-center text-[12px] text-text3">
                  {linesContent()}
                  <em class="text-[12px]">{linesFrom()}</em>
                </span>
              </div>
            }
            <SystemHeader type="chat" />
          </>
        }
      >
        <Show when={msgStatus.generatingList.length === 0}>
          <Capsule type="chat" botName={getCurrentAssistantForChat().name} />
        </Show>
        <div>
          <For each={msgs}>
            {(msg, index) => (
              // 这里使用三元表达式来显示消息时会有渲染不及时的问题
              <Show
                when={msg.content}
                fallback={
                  <div
                    ref={(el) => scrollToBottom(el, index())}
                    id={msg.id}
                    class={
                      'mb-1 flex ' + (msg.role === 'human' ? 'human ml-4 justify-end' : 'ai mr-4')
                    }
                  >
                    <Message
                      isEmpty
                      id={msg.id}
                      content="......"
                      type={msg.role}
                      botName={getCurrentAssistantForChat().name}
                    />
                  </div>
                }
              >
                <div
                  ref={(el) => scrollToBottom(el, index())}
                  class={`relative mb-1 flex max-w-[calc(100%-16px)] ${
                    msg.role === 'human' ? 'human ml-4 justify-end' : 'ai mr-4'
                  }`}
                >
                  <Message
                    id={msg.id}
                    content={msg.content}
                    type={msg.role}
                    botName={getCurrentAssistantForChat().name}
                    onRemove={() => handleRemoveMsg(msg.id)}
                  />
                </div>
              </Show>
            )}
          </For>
        </div>
      </Show>

      <div class="fixed bottom-0 left-0 right-0 h-[118px] bg-transparent backdrop-blur-xl" />
      <div class="fixed bottom-10 z-20 w-full px-4">
        <Input
          onInput={() => {
            cleanupForRestoreMsgs?.()
          }}
          showClearButton={previousMsg().state === 'complete'}
          onClear={() => {
            setPreviousMsg({ ...previousMsg(), state: 'complete' })
            setEditId('')
          }}
          // eslint-disable-next-line solid/reactivity
          send={async (v: string) => {
            // 将上一条消息设置为完成状态
            if (previousMsg().state === 'pending') {
              setPreviousMsg({ ...previousMsg(), state: 'complete' })
            }
            if (editId()) {
              // 重新编辑某一条消息
              editMsg({ content: inputText() }, editId())
              if (msgs.find((msg) => msg.id === editId())?.role === 'ai') {
                setEditId('')
                return
              }
              const id = msgs[msgs.findIndex((msg) => msg.id === editId()) + 1]?.id
              editMsg({ content: '' }, id)
              pushGeneratingStatus(id)
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
          type={(msgs.find((msg) => msg.id === editId())?.role as 'human' | 'ai') || 'human'}
        />
      </div>
    </div>
  )
}
