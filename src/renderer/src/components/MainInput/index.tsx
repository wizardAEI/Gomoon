import { Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { clearMsgs, msgs, restoreMsgs } from '../../store/msgs'
import { useToast } from '../ui/Toast'
import { useEventListener } from 'solidjs-use'
import { settingStore } from '@renderer/store/setting'
import RefreshIcon from '@renderer/assets/icon/base/RefreshIcon'
import Tools from './Tools'

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
  let cleanupForRestoreMsgs: (() => void) | undefined
  let [refreshing, setRefreshing] = createSignal<boolean>(false)
  let isCompositing = false
  const toast = useToast()
  function submit(content?: string) {
    props.send(content || props.text)
    props.setText('')
    textAreaDiv!.style.height = 'auto'
  }

  onMount(() => {
    if (props.autoFocusWhenShow) {
      const removeListener = window.api.showWindow(() => {
        textAreaDiv!.focus()
      })
      onCleanup(() => {
        removeListener()
      })
    }

    // 让input聚焦，box边框变为激活色
    const addActive = () => {
      textAreaContainerDiv!.attributes.setNamedItem(document.createAttribute('data-active'))
    }
    const removeActive = () => {
      if (textAreaContainerDiv && textAreaContainerDiv.attributes.getNamedItem('data-active')) {
        textAreaContainerDiv.attributes.removeNamedItem('data-active')
      }
    }
    textAreaDiv!.addEventListener('focus', addActive)
    textAreaDiv!.addEventListener('blur', removeActive)

    props.onMountHandler?.(textAreaDiv!)

    onCleanup(() => {
      textAreaDiv && textAreaDiv.removeEventListener('focus', addActive)
      textAreaDiv && textAreaDiv.removeEventListener('blur', removeActive)
    })
  })
  createEffect(() => {
    if (props.text !== undefined && textAreaDiv) {
      textAreaDiv.style.height = 'auto'
      textAreaDiv.style.height = `${textAreaDiv!.scrollHeight}px`
    }
  })

  return (
    <div class="flex flex-col gap-2">
      <Tools onSubmit={submit} />
      <div class="over relative flex w-full gap-1">
        <Show when={props.showClearButton && !props.text.length && !props.isGenerating}>
          <div class="-ml-3 mr-[2px] flex cursor-pointer flex-col items-center justify-center">
            <div
              onClick={() => {
                setRefreshing(true)
                setTimeout(() => {
                  setRefreshing(false)
                }, 600)
                toast.info(`${navigator.userAgent.includes('Mac') ? 'command' : 'ctrl'} + z 撤销`, {
                  duration: 1000,
                  position: 'top-3/4'
                })
                if (!msgs.length) return
                clearMsgs()
                cleanupForRestoreMsgs = useEventListener(document, 'keydown', (e) => {
                  if ((e.key === 'z' && e.ctrlKey) || (e.key === 'z' && e.metaKey)) {
                    restoreMsgs()
                    cleanupForRestoreMsgs?.()
                  }
                })
              }}
              class="group/refresh ml-1 h-8 w-8 rounded-full p-[7px] hover:bg-active-bac"
            >
              <RefreshIcon
                width={18}
                height={18}
                class={
                  'rotate-45 cursor-pointer text-gray group-hover/refresh:text-active' +
                  (refreshing() ? ' animate-rotate-180' : '')
                }
              />
            </div>
          </div>
        </Show>
        <div ref={textAreaContainerDiv} class="cyber-box relative flex flex-1 backdrop-blur-md">
          <textarea
            ref={textAreaDiv}
            value={props.text}
            disabled={props.disable}
            onCompositionStart={() => {
              isCompositing = true
            }}
            onCompositionEnd={() => {
              isCompositing = false
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isCompositing) return
              if (settingStore.sendWithCmdOrCtrl) {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  submit()
                  e.preventDefault()
                }
              } else {
                if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey || e.shiftKey)) {
                  submit()
                  e.preventDefault()
                }
              }
            }}
            onInput={(e) => {
              cleanupForRestoreMsgs?.()
              props.setText(e.target.value)
              e.preventDefault()
            }}
            rows={1}
            placeholder={
              props.placeholder ||
              (settingStore.sendWithCmdOrCtrl
                ? navigator.userAgent.includes('Mac')
                  ? 'Command + Enter 发送'
                  : 'Ctrl + Enter 发送'
                : 'Enter 发送，Shift+Enter 换行')
            }
            class="font-sans max-h-48 flex-1 resize-none rounded-2xl border-none bg-dark-pro px-4 py-[6px] text-sm text-text1 caret-text2 transition-none focus:outline-none"
          />
          {/* <button class="absolute bottom-1 right-1 h-8 w-8 cursor-pointer overflow-hidden rounded-full bg-cyber px-0 py-1">
          <ChatIcon class="duration-150 hover:text-active" width={24} height={24} />
        </button> */}
        </div>
      </div>
    </div>
  )
}
