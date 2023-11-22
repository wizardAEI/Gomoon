import Input from '@renderer/components/Input'
import Message from '@renderer/components/Message'
import { genAns, answerStore } from '../store/answer'
import { Show, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'

export default function Answer() {
  onMount(() => {
    window.api.multiCopy(async (_: IpcRendererEvent, msg: string) => {
      genAns(msg)
    })
  })
  return (
    <div class="flex h-screen flex-col gap-4 overflow-auto pb-24 pt-10">
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
            window.api.showWindow(() => {
              inputDiv.focus()
            })
          }}
        />
      </div>
    </div>
  )
}
