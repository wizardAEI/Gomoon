import { Roles } from '@renderer/lib/ai/langchain'
import MarkdownIt from 'markdown-it'
import { useClipboard, useEventListener } from 'solidjs-use'
import { Show, createMemo, createSignal } from 'solid-js'
import 'highlight.js/styles/atom-one-dark.css'
import ChatGptIcon from '@renderer/assets/icon/models/ChatGptIcon'
import { msgStatus, msgs } from '@renderer/store/msgs'
import mdHighlight from 'markdown-it-highlightjs'
import CapitalIcon from '../ui/CapitalIcon'
import MsgPopup, { MsgPopupByUser, Pause, WithDrawal } from './Popup'
import { ansStatus } from '@renderer/store/answer'
import ModelSelect from './ModelSelect'
export type MsgTypes = Roles | 'ans' | 'question'
export default function Message(props: {
  type: MsgTypes
  id?: string
  content: string
  botName?: string
  isEmpty?: boolean
}) {
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
      )} class="cursor-pointer absolute top-1 right-1 z-10 hover:h-3 group/copy copy-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
          <div class="absolute -right-1 top-3 opacity-0 group-hover/copy:opacity-100 duration-300">
            ${copied() ? 'Copied' : 'Copy'}
          </div>
      </div>
      ${rawCode}
      </div>`
    }
    return md.render(props.content)
  }
  // FEAT: 是否显示小组件
  const showComps = createMemo(
    () =>
      (props.type === 'ai' && props.id && !msgStatus.generatingList.includes(props.id)) ||
      (props.type === 'ans' && !ansStatus.isGenerating)
  )
  const showCompsByUser = createMemo(() => {
    if (props.id) {
      const genIndex = msgs.findIndex((msg) => msg.id === props.id) + 1
      return !msgStatus.generatingList.includes(msgs[genIndex]?.id || '') && props.type === 'human'
    }
    return false
  })

  return (
    <div class="group relative max-w-full">
      <Show
        when={!props.isEmpty}
        fallback={
          <Show when={props.id && !msgStatus.generatingList.includes(props.id)}>
            <WithDrawal type={props.type} />
          </Show>
        }
      >
        <Show
          when={
            (props.id && msgStatus.generatingList.includes(props.id)) ||
            (props.type === 'ans' && ansStatus.isGenerating)
          }
        >
          <Pause id={props.id} type={props.type} />
        </Show>
        <Show when={showComps()}>
          <MsgPopup type={props.type} id={props.id || ''} content={props.content} />
        </Show>
        <Show when={showCompsByUser()}>
          <MsgPopupByUser type={props.type} id={props.id || ''} content={props.content} />
        </Show>
      </Show>
      <div class={style[props.type] + ' relative m-4 rounded-2xl p-4'}>
        <div class={mdStyle[props.type] + ' markdown break-words'} innerHTML={htmlString()} />
        <Show when={showComps()}>
          <div class="-mb-2 -mr-1 mt-1 flex justify-end gap-1">
            <Show when={props.botName}>
              <CapitalIcon size={20} content={props.botName!} />
            </Show>
            <ModelSelect position={props.content.length < 18 ? 'left-1' : 'right-1'} />
          </div>
        </Show>
      </div>
    </div>
  )
}
