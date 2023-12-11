import Input from '@renderer/components/MainInput'
import Message from '@renderer/components/Message'
import { genAns, answerStore } from '../../store/answer'
import { For, Show, createSignal, onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'
import { useNavigate, useSearchParams } from '@solidjs/router'
import { assistants, getCurrentAssistantForAnswer } from '@renderer/store/assistants'
import SystemHeader from '@renderer/components/SystemHeader'
import SelectAssistantModal from './SelectAssistantModel'
import { setSelectedAssistantForAns } from '@renderer/store/user'

export default function Answer() {
  const [text, setText] = createSignal('')
  const nav = useNavigate()
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
      removeListener()
    })
  })

  return (
    <div class="flex h-full flex-col gap-4 overflow-auto pb-48 pt-6">
      <Show when={showModal()}>
        <SelectAssistantModal
          onConfirm={() => {
            setShowModal(false)
            genAns(text())
            setText('')
          }}
        />
      </Show>
      <div class="flex w-full select-none flex-col items-center justify-center gap-2 px-10 pt-8">
        <span class="text-sm text-gray">问答助手</span>
        <span class="whitespace-nowrap text-[12px] text-gray">&lt;{introduce()}&gt;</span>
      </div>
      <Show
        when={answerStore.question}
        fallback={
          <>
            <SystemHeader type="ans" />
            <div class=" h-screen w-screen select-none">
              <div class="mt-10 flex flex-wrap justify-center gap-2 px-3">
                <For each={assistants.filter((a) => a.type === 'ans').slice(0, 5)}>
                  {(a) => (
                    <div
                      onClick={async () => {
                        await setSelectedAssistantForAns(a.id)
                      }}
                      class={
                        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-solid bg-dark px-4 py-1 hover:border-active ' +
                        (a.id === getCurrentAssistantForAnswer().id
                          ? 'border-active'
                          : 'border-transparent')
                      }
                    >
                      <span class="text-text1 ">{a.name}</span>
                    </div>
                  )}
                </For>
                <div
                  class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-solid border-transparent bg-dark px-4 py-1 hover:border-active "
                  onClick={() => nav('/assistants?type=ans')}
                >
                  <span class="text-text1 ">更多助手...</span>
                </div>
              </div>
            </div>
          </>
        }
      >
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
