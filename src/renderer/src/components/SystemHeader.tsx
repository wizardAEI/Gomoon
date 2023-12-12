import { useNavigate } from '@solidjs/router'
import ModelSelect from './Message/ModelSelect'
import {
  assistants,
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat
} from '@renderer/store/assistants'
import { For } from 'solid-js'
import { setSelectedAssistantForAns, setSelectedAssistantForChat } from '@renderer/store/user'

export default function (props: { type: 'chat' | 'ans' }) {
  const nav = useNavigate()
  const currentA = props.type === 'ans' ? getCurrentAssistantForAnswer : getCurrentAssistantForChat
  const setSelected =
    props.type === 'ans' ? setSelectedAssistantForAns : setSelectedAssistantForChat
  return (
    <div class={'relative ' + (props.type === 'ans' ? 'mt-4' : 'mt-8')}>
      <div class="relative m-4 flex items-center justify-center gap-2 rounded-2xl bg-dark p-4">
        <span class="select-none">{currentA().name}</span>
        <div class="absolute bottom-1 right-2">
          <ModelSelect size={20} position="right-0" />
        </div>
      </div>
      <div class="mt-10 flex flex-wrap justify-center gap-2 px-3">
        <For each={assistants.filter((a) => a.type === props.type).slice(0, 5)}>
          {(a) => (
            <div
              onClick={async () => {
                setSelected(a.id)
              }}
              class={
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-solid bg-dark px-4 py-1 hover:border-active ' +
                (a.id === currentA().id ? 'border-active' : 'border-transparent')
              }
            >
              <span class="text-text1 ">{a.name}</span>
            </div>
          )}
        </For>
        <div
          class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-solid border-transparent bg-dark px-4 py-1 hover:border-active "
          onClick={() => {
            nav('/assistants?type=' + props.type)
          }}
        >
          <span class="text-text1 ">更多助手...</span>
        </div>
      </div>
    </div>
  )
}
