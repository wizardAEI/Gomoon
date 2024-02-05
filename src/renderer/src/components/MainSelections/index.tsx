import { useNavigate } from '@solidjs/router'
import ModelSelect from './ModelSelect'
import {
  assistants,
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat
} from '@renderer/store/assistants'
import { For, Show, createEffect, createSignal } from 'solid-js'
import {
  hasFirstTimeFor,
  setSelectedAssistantForAns,
  setSelectedAssistantForChat,
  setSelectedMemo,
  userData
} from '@renderer/store/user'
import { AssistantModel, MemoModel } from 'src/main/models/model'
import { getCurrentMemo, memories } from '@renderer/store/memo'
import { memoCapsule } from '@renderer/store/input'

export default function (props: { type: 'chat' | 'ans' }) {
  const nav = useNavigate()
  const currentA = props.type === 'ans' ? getCurrentAssistantForAnswer : getCurrentAssistantForChat
  const setSelected =
    props.type === 'ans' ? setSelectedAssistantForAns : setSelectedAssistantForChat
  const [modelList, setModelList] = createSignal<AssistantModel[]>([])
  const [memoList, setMemoList] = createSignal<MemoModel[]>([])
  createEffect((b) => {
    if (!assistants.length || !memories.length || b) return b
    setModelList(assistants.filter((a) => a.type === props.type).slice(0, 5))
    setMemoList(memories.slice(0, 5))
    return true
  }, false)
  return (
    <div class={'relative ' + (props.type === 'ans' ? 'mt-4' : 'mt-8')}>
      <div class="relative m-4 flex items-center justify-center gap-2 rounded-2xl bg-dark p-4">
        <span class="select-none text-base">{currentA().name}</span>
        <Show when={userData.firstTimeFor.modelSelect}>
          <div class="absolute bottom-[6px] right-8 animate-bounce select-none text-[12px]">
            点击图标可以切换模型 👉
          </div>
        </Show>

        <div
          class="absolute bottom-2 right-2"
          onClick={() => {
            hasFirstTimeFor('modelSelect')
          }}
        >
          <ModelSelect size={20} position="right-0" />
        </div>
      </div>
      <div class="mt-10 flex select-none flex-wrap justify-center gap-2 px-3">
        <For each={modelList()}>
          {(a) => (
            <div
              onClick={async () => {
                setSelected(a.id)
              }}
              class={
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-solid bg-dark px-4 py-1 hover:border-active ' +
                (a.id === currentA().id ? 'border-active' : 'border-transparent')
              }
            >
              <span class="text-text1 ">{a.name}</span>
            </div>
          )}
        </For>
        <div
          class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-solid border-transparent bg-dark px-4 py-1 hover:border-active "
          onClick={() => {
            nav('/assistants?type=' + props.type)
          }}
        >
          <span class="text-text1 ">更多助手...</span>
        </div>
      </div>
      <Show when={memoCapsule()}>
        <div class="mt-10 flex select-none flex-wrap justify-center gap-2 px-3">
          <For each={memoList()}>
            {(m) => (
              <div
                onClick={async () => {
                  setSelectedMemo(m.id)
                }}
                class={
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-solid bg-dark px-4 py-1 hover:border-active ' +
                  (m.id === getCurrentMemo().id ? 'border-active' : 'border-transparent')
                }
              >
                <span class="text-text1 ">{m.name}</span>
              </div>
            )}
          </For>
          <div
            class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-solid border-transparent bg-dark px-4 py-1 hover:border-active "
            onClick={() => {
              nav('/memo?type=' + props.type)
            }}
          >
            <span class="text-text1 ">更多记忆...</span>
          </div>
        </div>
      </Show>
    </div>
  )
}
