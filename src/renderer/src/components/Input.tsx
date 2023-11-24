import { createSignal, onCleanup, onMount } from 'solid-js'
import { clearMsgs } from '../store/msgs'

/**
 * FEAT: Input 组件，用于接收用户输入的文本，onMountHandler可以在外部操作 input 元素
 */
export default function Input(props: {
  send: (msg: string) => void
  onMountHandler?: (textAreaDiv: HTMLTextAreaElement) => void
  showClearButton?: boolean
  disable?: boolean
  isGenerating?: boolean
  autoFocusWhenShow?: boolean
}) {
  const [text, setText] = createSignal('')
  let textAreaDiv: HTMLTextAreaElement | undefined
  function submit() {
    props.send(text())
    setText('')
    textAreaDiv!.style.height = 'auto'
  }

  function focus() {
    textAreaDiv?.focus()
  }

  onMount(() => {
    props.onMountHandler?.(textAreaDiv!)

    if (props.autoFocusWhenShow) {
      const removeListener = window.api.showWindow(focus)
      onCleanup(() => {
        removeListener()
      })
    }

    textAreaDiv &&
      textAreaDiv.addEventListener('input', () => {
        textAreaDiv!.style.height = 'auto'
        textAreaDiv!.style.height = `${textAreaDiv!.scrollHeight + 4}px`
      })
  })
  return (
    <div class="relative flex w-full rounded-2xl bg-[#ffffff70] backdrop-blur-md">
      <textarea
        ref={textAreaDiv}
        value={text()}
        onkeydown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            submit()
            e.preventDefault()
            return
          }
        }}
        oninput={(e) => {
          setText(e.target.value)
          e.preventDefault()
          return false
        }}
        rows={1}
        placeholder="Ctrl/Cmd+Enter 发送"
        class="font-sans max-h-24 flex-1 resize-none rounded-2xl border-2 border-[#ffffff20] bg-transparent px-4 py-2 text-base duration-300 focus:border-active focus:outline-none"
      />
      {props.showClearButton && !props.isGenerating && (
        <button
          class={
            'absolute right-3 top-[6px] h-2/3 cursor-pointer overflow-hidden rounded-lg border-0 shadow-md active:animate-click ' +
            (text().length ? 'w-0 px-0' : 'px-2')
          }
          onClick={() => {
            clearMsgs()
          }}
        >
          {!text().length && '清空历史'}
        </button>
      )}
    </div>
  )
}
