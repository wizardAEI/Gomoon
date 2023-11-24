import Input from '@renderer/components/Input'
import Message from '@renderer/components/Message'
import { genAns, answerStore } from '../store/answer'
import { Show, onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'
import { useLocation } from '@solidjs/router'

export default function Answer() {
  onMount(() => {
    const query = useLocation().query
    if (query.q) {
      genAns(query.q as string)
    }
    const removeListener = window.api.multiCopy((_: IpcRendererEvent, msg: string) => {
      genAns(msg)
    })
    onCleanup(() => {
      removeListener()
    })
  })

  return (
    <div class="flex h-full flex-col gap-4 overflow-auto pb-24 pt-10">
      <Show
        when={answerStore.question}
        fallback={
          <div class="cursor-pointer">
            <Message content={'翻译 / 分析报错'} type="system" />
          </div>
        }
      >
        <Message content={answerStore.question} type="question" />
      </Show>
      {answerStore.answer && <Message content={answerStore.answer} type="ans" />}
      <div class="fixed bottom-10 w-full px-8">
        <Input
          send={genAns}
          // 自动聚焦
          onMountHandler={(inputDiv: HTMLTextAreaElement) => {
            inputDiv.focus()
          }}
          // onShow自动聚焦
          autoFocusWhenShow
        />
      </div>
    </div>
  )
}
