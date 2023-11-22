import { Roles } from '@renderer/lib/langchain'
import MarkdownIt from 'markdown-it'
import mdHighlight from 'markdown-it-highlightjs'
type MsgTypes = Roles | 'ans' | 'question'
import { useClipboard, useEventListener } from 'solidjs-use'
import { createSignal } from 'solid-js'
import 'highlight.js/styles/atom-one-dark.css'

export default function Message(props: { type: MsgTypes; content: string }) {
  const style: Record<MsgTypes, string> = {
    ai: 'bg-gradient-to-br from-[#4c4d51] to-[#404144]',
    human: 'bg-gradient-to-br from-[#fffffe] to-[#d9d8d5]',
    system: 'bg-gradient-to-br from-[#62c0da] to-[#53a1b8]',
    question: 'bg-gradient-to-br from-[#fffffe] to-[#d9d8d5]',
    ans: 'bg-gradient-to-br from-[#4c4d51] to-[#404144]'
  }
  const mdStyle: Record<MsgTypes, string> = {
    ai: 'text-sm dark-theme',
    ans: 'text-sm dark-theme',
    human: 'text-sm',
    system: 'select-none text-center text-base',
    question: 'text-sm'
  }
  const [source] = createSignal('')
  const { copy, copied } = useClipboard({ source, copiedDuring: 1000 })

  const htmlString = () => {
    const md = MarkdownIt({
      linkify: true,
      breaks: true
    }).use(mdHighlight)

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

      return `<div class="relative">
      <div data-code=${encodeURIComponent(
        token.content
      )} class="cursor-pointer absolute top-2 right-2 z-10 group copy-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
          <div class="absolute -right-1 opacity-0 group-hover:opacity-100 duration-300">
            ${copied() ? 'Copied' : 'Copy'}
          </div>
      </div>
      ${rawCode}
      </div>`
    }

    return md.render(props.content)
  }
  return (
    <div class={style[props.type] + ' m-4 rounded-2xl p-4 '}>
      <div class={mdStyle[props.type] + ' markdown'} innerHTML={htmlString()} />
    </div>
  )
}
