import { Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { clearMsgs, msgs, restoreMsgs } from '../../store/chat'
import { useToast } from '../ui/Toast'
import { useEventListener } from 'solidjs-use'
import { settingStore } from '@renderer/store/setting'
import RefreshIcon from '@renderer/assets/icon/base/RefreshIcon'
import Tools, { Artifacts } from './Tools'
import { inputText, isNetworking, memoCapsule, setInputText, tokens } from '@renderer/store/input'
import { useLoading } from '../ui/DynamicLoading'
import { searchByBaidu } from '@renderer/lib/ai/search'
import { userData } from '@renderer/store/user'
import { processMemo } from '@renderer/lib/ai/memo'
import { clearAns, restoreAns } from '@renderer/store/answer'

const typeDict: {
  [key: string]: 'chat' | 'ans'
} = {
  ai: 'chat',
  human: 'chat',
  ans: 'ans',
  question: 'ans'
}

/**
 * FEAT: Input 组件，用于接收用户输入的文本，onMountHandler可以在外部操作 input 元素
 */
export default function Input(props: {
  send: (msg: string) => void
  onMountHandler?: (textAreaDiv: HTMLTextAreaElement) => void
  type: 'ai' | 'human' | 'ans' | 'question'
  showClearButton?: boolean
  disable?: boolean
  isGenerating?: boolean
  autoFocusWhenShow?: boolean
  placeholder?: string
}) {
  let textAreaDiv: HTMLTextAreaElement | undefined
  let textAreaContainerDiv: HTMLDivElement | undefined
  let isCompositing = false
  let cleanupForRestoreMsgs: (() => void) | undefined
  const [refreshing, setRefreshing] = createSignal(false)
  const [inputTokenNum, setInputTokenNum] = createSignal(0)
  const [artifactTokenNum, setArtifactTokenNum] = createSignal(0)
  const [artifacts, setArtifacts] = createSignal<Artifacts[]>([])
  const artifactContent = () => {
    const total = artifacts()
      .map((a) => a.val)
      .join('\n\n')
    return total.length ? total + '<gomoon-drawer>\n\n依据上述信息回答问题：</gomoon-drawer>' : ''
  }

  const toast = useToast()
  const dynamicLoading = useLoading()

  // content 为 tools 传递来的信息，优先级：content > inputText()
  async function submit() {
    setInputTokenNum(0)
    if (artifactContent().length) {
      props.send(artifactContent() + inputText())
      setInputText(''), setArtifacts([])
      return
    }
    let content = ''
    if (memoCapsule() && props.type !== 'ai' && props.type !== 'ans') {
      dynamicLoading.show('记忆胶囊启动⚡️⚡️')
      try {
        content = processMemo(
          inputText() ?? '',
          await window.api.getMemoryData({
            id: userData.selectedMemo,
            content: inputText()
          })
        )
      } catch (e) {
        toast.error((e as Error).message || '查询失败')
      }
      dynamicLoading.hide()
    }
    if (isNetworking() && props.type !== 'ai' && props.type !== 'ans') {
      dynamicLoading.show('查询中')
      try {
        content = await searchByBaidu(inputText(), (m) => dynamicLoading.show(m))
      } catch (e) {
        toast.error((e as Error).message || '查询失败')
      }
      dynamicLoading.hide()
    }
    props.send(content || inputText())
    setInputText('')
    textAreaDiv!.style.height = 'auto'
  }

  createEffect(() => {
    onCleanup(() => cleanupForRestoreMsgs?.())
  })

  createEffect(async () => {
    const content = artifactContent()
    if (!content) {
      setArtifactTokenNum(0)
      return
    }
    // 如果300ms内返回则不显示loading
    const timer = setTimeout(() => {
      dynamicLoading.show('正在计算Token，这取决于电脑运行本地模型的速度')
    }, 300)
    const num = await window.api.getTokenNum(content)
    clearTimeout(timer)
    setArtifactTokenNum(num)
    dynamicLoading.hide()
  })

  const tokenConsumeDisplay = createMemo(() => {
    if (props.type === 'ans' || props.type === 'question') {
      return `${tokens().consumedTokenForAns(inputTokenNum() + artifactTokenNum())} / ${
        tokens().maxToken
      }`
    }
    return `${tokens().consumedTokenForChat(inputTokenNum() + artifactTokenNum())} / ${
      tokens().maxToken
    }`
  })

  onMount(() => {
    if (props.autoFocusWhenShow) {
      const removeListener = window.api.showWindow(() => {
        textAreaDiv!.focus()
      })
      onCleanup(() => {
        removeListener()
      })
      // 计算 token 数量
      window.api.getTokenNum(inputText()).then((num) => {
        setInputTokenNum(num)
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
    if (inputText() !== undefined && textAreaDiv) {
      textAreaDiv!.style.height = 'auto'
      textAreaDiv!.style.height = `${textAreaDiv!.scrollHeight}px`
    }
  })

  async function onInput(e) {
    e.preventDefault()
    cleanupForRestoreMsgs?.()
    setInputText(e.target.value)
    setInputTokenNum(await window.api.getTokenNum(e.target.value))
  }

  return (
    <div class="flex flex-col gap-2">
      <Tools
        artifacts={artifacts}
        setArtifacts={setArtifacts}
        onInput={(c) => setInputText(c)}
        type={typeDict[props.type]}
      />
      <div class="over relative flex w-full justify-center gap-1">
        <Show when={props.showClearButton && !props.isGenerating && !inputText()?.length}>
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
                if (props.type === 'ans' || props.type === 'question') {
                  clearAns()
                  cleanupForRestoreMsgs = useEventListener(document, 'keydown', (e) => {
                    if ((e.key === 'z' && e.ctrlKey) || (e.key === 'z' && e.metaKey)) {
                      restoreAns()
                      cleanupForRestoreMsgs?.()
                    }
                  })
                  return
                }
                if (!msgs.length) return
                clearMsgs()
                cleanupForRestoreMsgs = useEventListener(document, 'keydown', (e) => {
                  if ((e.key === 'z' && e.ctrlKey) || (e.key === 'z' && e.metaKey)) {
                    restoreMsgs()
                    cleanupForRestoreMsgs?.()
                  }
                })
              }}
              class="group/refresh ml-1 h-8 w-8 rounded-full p-[7px] hover:bg-dark-plus"
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
        <div
          ref={textAreaContainerDiv}
          class="cyber-box relative flex flex-1 backdrop-blur-md md:max-w-xl lg:max-w-3xl"
        >
          <div class="absolute bottom-0 left-0 right-0 top-0 -z-10 rounded-2xl bg-dark-pro"></div>
          <div class="absolute bottom-8 right-3 -z-10 h-0 select-none overflow-visible leading-8 text-text3">
            {tokenConsumeDisplay()}
          </div>
          <textarea
            ref={textAreaDiv}
            value={inputText()}
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
            onInput={onInput}
            rows={1}
            placeholder={
              props.placeholder ||
              (settingStore.sendWithCmdOrCtrl
                ? navigator.userAgent.includes('Mac')
                  ? 'Command + Enter 发送'
                  : 'Ctrl + Enter 发送'
                : 'Enter 发送，Shift+Enter 换行')
            }
            class="font-sans max-h-48 flex-1 resize-none rounded-2xl border-none bg-transparent px-4 py-[6px] text-sm text-text1 caret-text2 transition-none focus:outline-none"
          />
          {/* <button class="absolute bottom-1 right-1 h-8 w-8 cursor-pointer overflow-hidden rounded-full bg-cyber px-0 py-1">
          <ChatIcon class="duration-150 hover:text-active" width={24} height={24} />
        </button> */}
        </div>
      </div>
    </div>
  )
}
