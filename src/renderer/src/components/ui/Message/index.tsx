import { Roles } from '@renderer/lib/langchain'
import MarkdownIt from 'markdown-it'
type MsgTypes = Roles | 'ans' | 'question'
import { useClipboard, useEventListener } from 'solidjs-use'
import { Show, createEffect, createSignal } from 'solid-js'
import 'highlight.js/styles/atom-one-dark.css'
import ChatGptIcon from '@renderer/assets/icon/models/ChatGptIcon'
import { msgStatus } from '@renderer/store/msgs'
import { ansStatus } from '@renderer/store/answer'
import mdHighlight from 'markdown-it-highlightjs'
import CapitalIcon from '../CapitalIcon'
export default function Message(props: { type: MsgTypes; content: string; botName?: string }) {
  const style: Record<MsgTypes, string> = {
    ai: 'bg-dark',
    human: 'bg-light',
    system: 'bg-dark',
    question: 'bg-light',
    ans: 'bg-dark'
  }
  const mdStyle: Record<MsgTypes, string> = {
    ai: 'text-sm dark-theme',
    ans: 'text-sm dark-theme',
    human: 'text-sm',
    system: 'select-none text-center text-base dark-theme',
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

      return `<div class="relative mt-1 w-full">
      <div data-code=${encodeURIComponent(
        token.content
      )} class="cursor-pointer absolute top-1 right-1 z-10 group copy-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
          <div class="absolute -right-1 top-3 opacity-0 group-hover:opacity-100 duration-300">
            ${copied() ? 'Copied' : 'Copy'}
          </div>
      </div>
      ${rawCode}
      </div>`
    }
    return md.render(props.content)
  }

  // FEAT: 当最新的消息是生成完成的时候，显示图标
  const [showIcons, setShowIcons] = createSignal(false)
  createEffect(() => {
    if (showIcons()) return
    if (props.type === 'ai') {
      if (!msgStatus.isGenerating) {
        setShowIcons(true)
      }
    }
    if (props.type === 'ans') {
      if (!ansStatus.isGenerating) {
        setShowIcons(true)
      }
    }
  })

  return (
    <div class="max-w-full">
      <div class={style[props.type] + ' relative m-4 rounded-2xl p-4'}>
        <div class={mdStyle[props.type] + ' markdown break-words'} innerHTML={htmlString()} />
        <Show when={showIcons()}>
          <div class="-mb-2 -mr-1 flex justify-end gap-1">
            <Show when={props.botName}>
              <CapitalIcon content={props.botName!} />
            </Show>
            <ChatGptIcon width={16} height={16} class="cursor-pointer overflow-hidden rounded-md" />
            {/* <WenxinIcon width={16} height={16} class="cursor-pointer overflow-hidden rounded-md" /> */}
          </div>
        </Show>
      </div>
    </div>
  )
}
