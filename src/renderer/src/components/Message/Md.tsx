import MarkdownIt from 'markdown-it'
import { Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { useClipboard, useEventListener } from 'solidjs-use'
import mdHighlight from 'markdown-it-highlightjs'
import SpeechIcon from '@renderer/assets/icon/SpeechIcon'
import FindIcon from '@renderer/assets/icon/FindIcon'
import { load } from 'cheerio'

export default function Md(props: { class: string; content: string }) {
  let selectContent = ''
  let [findContent, setFindContent] = createSignal('')
  const [source] = createSignal('')
  const { copy, copied } = useClipboard({ source, copiedDuring: 1000 })
  const [showSelectBtn, setShowSelectBtn] = createSignal(false)
  let btn: HTMLDivElement | undefined
  function speakText() {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(selectContent)
      utterance.lang = 'zh-CN'
      window.speechSynthesis.speak(utterance)
    } else {
      console.error('Your browser does not support speech synthesis')
    }
    setShowSelectBtn(false)
  }
  function findText() {
    setFindContent(selectContent)
    setShowSelectBtn(false)
  }

  let contentDom: HTMLDivElement | undefined
  onMount(() => {
    // FEAT: 用户滑动选择文本
    const showButton = (e: MouseEvent) => {
      const selection = window.getSelection()
      setFindContent('')
      if (selection) {
        if (selection.toString().length > 0) {
          setShowSelectBtn(true)
          btn!.style.top = `${e.clientY - 20}px`
          btn!.style.left = `${e.clientX + 10}px`
          if (btn!.offsetLeft + btn!.clientWidth > window.innerWidth) {
            btn!.style.left = `${e.clientX - btn!.clientWidth - 10}px`
            btn!.style.top = `${e.clientY - 20}px`
          }
          selectContent = selection.toString()
        } else {
          setShowSelectBtn(false)
        }
      }
    }
    const hideButton = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      // 如果不是点击在contentDom上，则隐藏复制按钮
      if (!contentDom?.contains(el) && !btn?.contains(el)) {
        showSelectBtn() && setShowSelectBtn(false)
      }
    }
    contentDom?.addEventListener('mouseup', showButton)
    window.addEventListener('mouseup', hideButton)
    // 监听 ctrl + c 事件
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'c') || (e.metaKey && e.key === 'c')) {
        setShowSelectBtn(false)
      }
      if ((e.ctrlKey && e.key === 'f') || (e.metaKey && e.key === 'f')) {
        findText()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    onCleanup(() => {
      contentDom?.removeEventListener('mouseup', showButton)
      window.removeEventListener('mouseup', hideButton)
      window.addEventListener('keydown', handleKeydown)
    })
  })

  const htmlString = createMemo(() => {
    let content = props.content

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
      let rawCode = fence(...args)
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

    const $ = load(`<div id="gomoon-md">${md.render(content)}</div>`)
    // FEAT: 对findContent高亮
    function highlightText(node: any) {
      if (!findContent()) return
      $(node)
        .contents()
        .each(function (_, elem) {
          if (elem.type === 'text') {
            // 如果是文本节点，则替换文本
            const text = $(elem).text()
            const newText = text.replace(
              new RegExp(findContent(), 'gi'),
              `<span class="bg-active rounded-sm">${findContent()}</span>`
            )
            $(elem).replaceWith(newText)
          } else if (
            elem.type === 'tag' &&
            !['script', 'style', 'svg'].includes(elem.tagName.toLowerCase())
          ) {
            highlightText(elem)
          }
        })
    }
    highlightText($('#gomoon-md'))
    return $.html() || ''
  })

  return (
    <>
      <div ref={contentDom} class={props.class} innerHTML={htmlString()} />
      <Show when={showSelectBtn()}>
        <div ref={btn} class="fixed flex gap-1 rounded-[10px] bg-dark-plus px-1 py-[2px]">
          <SpeechIcon
            onClick={speakText}
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
          />
          <FindIcon
            onClick={findText}
            height={20}
            width={20}
            class="cursor-pointer text-gray duration-100 hover:text-active"
          />
        </div>
      </Show>
    </>
  )
}
