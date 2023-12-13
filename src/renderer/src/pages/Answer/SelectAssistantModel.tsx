import EscIcon from '@renderer/assets/icon/EscIcon'
import { assistants } from '@renderer/store/assistants'
import { setSelectedAssistantForAns } from '@renderer/store/user'
import { For, onCleanup, onMount } from 'solid-js'

const SelectKey = {
  0: (
    <svg
      class="text-active"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="5731"
      width="20"
      height="20"
      fill="currentColor"
    >
      <path
        d="M170.666667 384v170.666667h682.666666V384h85.333334v213.333333a42.666667 42.666667 0 0 1-42.666667 42.666667H128a42.666667 42.666667 0 0 1-42.666667-42.666667V384h85.333334z"
        p-id="5732"
      ></path>
    </svg>
  ),
  1: (
    <div class="h-4 w-4 rounded-sm border-solid border-active text-center text-sm leading-3 text-active">
      1
    </div>
  ),
  2: (
    <div class="h-4 w-4 rounded-sm border-solid border-active text-center text-sm leading-3 text-active">
      2
    </div>
  ),
  3: (
    <div class="h-4 w-4 rounded-sm border-solid border-active text-center text-sm leading-3 text-active">
      3
    </div>
  ),
  4: (
    <div class="h-4 w-4 rounded-sm border-solid border-active text-center text-sm leading-3 text-active">
      4
    </div>
  )
}

export default function (props: { onConfirm: () => void; onCancel: () => void }) {
  onMount(() => {
    async function select(e: KeyboardEvent) {
      const a = assistants.filter((a) => a.type === 'ans')
      // ctrl 或 ⌘ 键
      if (e.ctrlKey || e.metaKey) return
      if (e.code === 'Space') {
        await setSelectedAssistantForAns(a[0].id)
        props.onConfirm()
      }
      if (e.code === 'Digit1') {
        await setSelectedAssistantForAns(a[1].id)
        props.onConfirm()
      }
      if (e.code === 'Digit2') {
        await setSelectedAssistantForAns(a[2].id)
        props.onConfirm()
      }
      if (e.code === 'Digit3') {
        await setSelectedAssistantForAns(a[3].id)
        props.onConfirm()
      }
      if (e.code === 'Digit4') {
        await setSelectedAssistantForAns(a[4].id)
        props.onConfirm()
      }
      if (e.code === 'Escape') {
        props.onCancel()
      }
    }
    window.addEventListener('keydown', select)
    onCleanup(() => window.removeEventListener('keydown', select))
  })
  return (
    <div class="fixed left-0 top-0 z-50 h-screen w-screen select-none bg-[#00000080]">
      <div class="mt-40 flex flex-wrap justify-center gap-2 px-3">
        <For each={assistants.filter((a) => a.type === 'ans').slice(0, 5)}>
          {(a, i) => (
            <div
              onClick={async () => {
                await setSelectedAssistantForAns(a.id)
                props.onConfirm()
              }}
              class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-solid border-transparent bg-dark px-4 py-1 hover:border-active"
            >
              <span class="text-text1">{a.name}</span>
              {SelectKey[i()]}
            </div>
          )}
        </For>
        <div
          onClick={props.onCancel}
          class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-solid border-transparent bg-dark px-4 py-1 hover:border-active"
        >
          <span>退出 (ESC)</span>
          <EscIcon width={25} height={16} class="text-active" />
        </div>
      </div>
    </div>
  )
}
