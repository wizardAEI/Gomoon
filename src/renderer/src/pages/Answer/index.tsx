import Input from '@renderer/components/MainInput'
import Message from '@renderer/components/Message'
import { genAns, answerStore, clearAns, ansStatus } from '../../store/answer'
import { Show, createSignal, onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'
import { useSearchParams } from '@solidjs/router'
import { getCurrentAssistantForAnswer } from '@renderer/store/assistants'
import SystemHeader from '@renderer/components/SystemHeader'
import SelectAssistantModal from './SelectAssistantModel'
import Capsule from '@renderer/components/Capsule'

export default function Answer() {
  const [text, setText] = createSignal('')
  const [showModal, setShowModal] = createSignal(false)
  const [introduce, setIntroduce] = createSignal('每')
  const [query, setQuery] = useSearchParams()
  setQuery({
    q: ''
  })
  onMount(() => {
    const introduceFull = '每一次回答都将是一次新的对话'
    // 打字机效果,逐渐显示introduce
    const timer = setInterval(() => {
      if (introduceFull.length === introduce().length) {
        clearInterval(timer)
      } else {
        setIntroduce((i) => {
          return i + introduceFull[i.length]
        })
      }
    }, 70)

    if (query.q) {
      setText(query.q as string)
      setShowModal(true)
    }
    const removeListener = window.api.multiCopy((_: IpcRendererEvent, msg: string) => {
      setText(msg)
      setShowModal(true)
    })
    onCleanup(() => {
      clearAns()
      removeListener()
    })
  })

  return (
    <div class="flex h-full flex-col gap-4 overflow-auto pb-48 pt-10">
      <Show when={showModal()}>
        <SelectAssistantModal
          onConfirm={() => {
            setShowModal(false)
            genAns(text())
            setText('')
          }}
          onCancel={() => {
            setShowModal(false)
          }}
        />
      </Show>
      <Show
        when={answerStore.question}
        fallback={
          <>
            {
              <div class="flex w-full select-none flex-col items-center justify-center gap-2 px-10 pt-8">
                <span class="text-sm text-gray">问答助手</span>
                <span class="whitespace-nowrap text-[12px] text-gray">&lt;{introduce()}&gt;</span>
              </div>
            }
            <SystemHeader type="ans" />
          </>
        }
      >
        <div class="mt-6">
          <Message content={answerStore.question} id="question" type="question" />
        </div>
      </Show>
      <Show when={answerStore.answer}>
        <Show when={!ansStatus.isGenerating}>
          <Capsule type="ans" botName={getCurrentAssistantForAnswer().name} />
        </Show>
        <Message
          content={answerStore.answer}
          type="ans"
          botName={getCurrentAssistantForAnswer().name}
        />
      </Show>

      <div class="fixed bottom-10 w-full px-4">
        <Input
          text={text()}
          setText={setText}
          disable={showModal()}
          send={genAns}
          // 自动聚焦
          onMountHandler={(input: HTMLTextAreaElement) => {
            input.focus()
          }}
          // onShow自动聚焦
          autoFocusWhenShow
          type="ans"
        />
      </div>
    </div>
  )
}
