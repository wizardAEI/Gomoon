import Input from '@renderer/components/MainInput'
import Message from '@renderer/components/Message'
import { genAns, answerStore } from '../../store/answer'
import { Show, createSignal, onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'
import { useSearchParams } from '@solidjs/router'
import { getCurrentAssistantForAnswer } from '@renderer/store/assistants'
import SystemHeader from '@renderer/components/SystemHeader'
import SelectAssistantModal from './SelectAssistantModel'

export default function Answer() {
  const [text, setText] = createSignal('')
  const [showModal, setShowModal] = createSignal(false)
  const [query, setQuery] = useSearchParams()
  setQuery({
    q: ''
  })
  onMount(() => {
    if (query.q) {
      setText(query.q as string)
      setShowModal(true)
    }
    const removeListener = window.api.multiCopy((_: IpcRendererEvent, msg: string) => {
      setText(msg)
      setShowModal(true)
    })
    onCleanup(() => {
      removeListener()
    })
  })

  return (
    <div class="flex h-full flex-col gap-4 overflow-auto pb-48 pt-6">
      <Show when={showModal()}>
        <SelectAssistantModal
          onConfirm={() => {
            setShowModal(false)
            // FIXME: 修复当1，2，3，4时会自动输入到最后，而空格时不会
            genAns(text())
            setText('')
          }}
        />
      </Show>
      <Show when={answerStore.question} fallback={<SystemHeader type="ans" />}>
        <Message content={answerStore.question} id="question" type="question" />
      </Show>
      {answerStore.answer && (
        <Message
          content={answerStore.answer}
          type="ans"
          botName={getCurrentAssistantForAnswer().name}
        />
      )}
      <div class="fixed bottom-10 w-full px-8">
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
        />
      </div>
    </div>
  )
}
