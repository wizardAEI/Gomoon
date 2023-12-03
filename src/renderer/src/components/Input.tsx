import { createEffect, onCleanup, onMount } from 'solid-js'
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
  placeholder?: string
  text: string
  setText: (text: string) => void
}) {
  let textAreaDiv: HTMLTextAreaElement | undefined
  let textAreaContainerDiv: HTMLDivElement | undefined
  function submit() {
    props.send(props.text)
    props.setText('')
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

    // 让input聚焦，box边框变为激活色
    const addActive = (el: HTMLDivElement) => {
      el.attributes.setNamedItem(document.createAttribute('data-active'))
    }
    const removeActive = (el: HTMLDivElement) => {
      el.attributes.removeNamedItem('data-active')
    }
    textAreaDiv!.addEventListener('focus', () => {
      console.log('focus')
      addActive(textAreaContainerDiv!)
    })
    textAreaDiv!.addEventListener('blur', () => {
      console.log('blur')
      removeActive(textAreaContainerDiv!)
    })
    onCleanup(() => {
      textAreaDiv!.removeEventListener('focus', () => {
        addActive(textAreaContainerDiv!)
      })
      textAreaDiv!.removeEventListener('blur', () => {
        removeActive(textAreaContainerDiv!)
      })
    })
  })
  createEffect(() => {
    if (props.text !== undefined && textAreaDiv) {
      textAreaDiv.style.height = 'auto'
      textAreaDiv.style.height = `${textAreaDiv!.scrollHeight}px`
    }
  })

  return (
    <div ref={textAreaContainerDiv} class="cyber-box relative flex w-full backdrop-blur-md">
      <textarea
        ref={textAreaDiv}
        value={props.text}
        onkeydown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            submit()
            e.preventDefault()
            return
          }
        }}
        oninput={(e) => {
          props.setText(e.target.value)
          e.preventDefault()
          return false
        }}
        rows={1}
        placeholder={props.placeholder || 'Ctrl/Cmd+Enter 发送'}
        class="font-sans max-h-48 flex-1 resize-none rounded-2xl border-none bg-dark-pro px-4 py-2 text-base text-text1 caret-text2 transition-none focus:outline-none"
      />
      {props.showClearButton && !props.isGenerating && (
        <button
          class={
            'absolute right-3 top-[6px] h-2/3 cursor-pointer overflow-hidden rounded-lg border-0 bg-cyber text-text2 shadow-md active:animate-click ' +
            (props.text.length ? 'w-0 px-0' : 'px-2')
          }
          onClick={() => {
            clearMsgs()
          }}
        >
          {!props.text.length && '清空历史'}
        </button>
      )}
    </div>
  )
}
