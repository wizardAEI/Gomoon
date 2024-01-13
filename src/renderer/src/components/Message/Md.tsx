import MarkdownIt from 'markdown-it'
import { Show, createSignal, onMount } from 'solid-js'
import { useClipboard, useEventListener } from 'solidjs-use'
import mdHighlight from 'markdown-it-highlightjs'
import SpeechIcon from '@renderer/assets/icon/SpeechIcon'
import FindIcon from '@renderer/assets/icon/FindIcon'

export default function Md(props: { class: string; content: string }) {
  const [source] = createSignal('')
  const { copy, copied } = useClipboard({ source, copiedDuring: 1000 })
  const [showCopyBtn, setShowCopyBtn] = createSignal(false)
  function speakText(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      window.speechSynthesis.speak(utterance)
    } else {
      console.error('Your browser does not support speech synthesis')
    }
  }

  let contentDom: HTMLDivElement | undefined
  onMount(() => {
    // FEAT: 用户滑动选择文本
    contentDom?.addEventListener('mouseup', () => {
      const selection = window.getSelection()
      if (selection) {
        if (selection.toString().length > 0) {
          setShowCopyBtn(true)
          // FEAT: 弹出朗读文本按钮
          // speakText(selection.toString())
        } else {
          setShowCopyBtn(false)
        }
      }
    })
    window.addEventListener('mouseup', (e) => {
      const el = e.target as HTMLElement
      // 如果不是点击在contentDom上，则隐藏复制按钮
      if (!contentDom?.contains(el)) {
        setShowCopyBtn(false)
      }
    })
  })

  function htmlString(content: string) {
    const md = MarkdownIt({
      linkify: true,
      breaks: true
    }).use(mdHighlight)

    // FEAT: 限制图片宽度
    md.renderer.rules.image = (tokens, idx) => {
      const token = tokens[idx]
      const srcIndex = token.attrIndex('src')
      const src = token.attrs![srcIndex][1]
      const alt = token.content || ''
      const style = `max-width: 300px; border-radius: 5px;`
      return `<img src="${src}" alt="${alt}" style="${style}" />`
    }

    // FEAT: 复制功能
    useEventListener('click', (e) => {
      const el = e.target as HTMLElement
      let code: null | string = null

      if (el.matches('div > div.copy-btn')) {
        code = decodeURIComponent(el.dataset.code!)
        copy(code)
      }
      if (el.matches('div > div.copy-btn > svg')) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        code = decodeURIComponent(el.parentElement?.dataset.code!)
        copy(code)
      }
    })
    const fence = md.renderer.rules.fence!
    md.renderer.rules.fence = (...args) => {
      const [tokens, idx] = args
      const token = tokens[idx]
      const rawCode = fence(...args)

      return `<div class="relative mt-1 w-full text-text1">
          <div data-code=${encodeURIComponent(
            token.content
          )} class="cursor-pointer absolute top-1 right-1 z-10 hover:h-3 group/copy copy-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
              <div class="absolute select-none -right-1 top-3 opacity-0 group-hover/copy:opacity-100 duration-300 text-text1">
                ${copied() ? 'Copied' : 'Copy'}
              </div>
          </div>
          ${rawCode}
          </div>`
    }

    return md.render(content)
  }
  return (
    <>
      <Show when={showCopyBtn()}>
        <div class="absolute flex gap-1 rounded-[10px] bg-dark-plus px-1 py-[2px]">
          <SpeechIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
          />
          <FindIcon
            height={20}
            width={20}
            class="cursor-pointer text-gray duration-100 hover:text-active"
          />
        </div>
      </Show>
      <div ref={contentDom} class={props.class} innerHTML={htmlString(props.content)} />
    </>
  )
}
