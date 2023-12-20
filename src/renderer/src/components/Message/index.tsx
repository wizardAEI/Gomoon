import { Roles } from '@renderer/lib/ai/langchain'
import MarkdownIt from 'markdown-it'
import { useClipboard, useEventListener } from 'solidjs-use'
import { Show, createMemo, createSignal } from 'solid-js'
import 'highlight.js/styles/atom-one-dark.css'
import { msgStatus, msgs } from '@renderer/store/msgs'
import mdHighlight from 'markdown-it-highlightjs'
import MsgPopup, { MsgPopupByUser, Pause, WithDrawal } from './Popup'
import { ansStatus } from '@renderer/store/answer'
import { parseMeta } from '@renderer/lib/ai/parseString'
import SpecialTypeContent from './SpecialTypeContent'
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
    ai: 'text-sm',
    ans: 'text-sm',
    human: 'text-sm text-text-dark',
    system: 'text-base select-none text-center text-base dark-theme px-4',
    question: 'text-sm text-text-dark'
  }
  const [source] = createSignal('')
  const { copy, copied } = useClipboard({ source, copiedDuring: 1000 })
  const meta = parseMeta(props.content)
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

      return `<div class="relative mt-1 w-full text-text1">
      <div data-code=${encodeURIComponent(
        token.content
      )} class="cursor-pointer absolute top-1 right-1 z-10 hover:h-3 group/copy copy-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
          <div class="absolute -right-1 top-3 opacity-0 group-hover/copy:opacity-100 duration-300 text-text1">
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
      return (
        !msgStatus.generatingList.includes(msgs[genIndex]?.id || '') &&
        props.type === 'human' &&
        meta.type === 'text'
      )
    }
    return false
  })

  return (
    <div class="group relative max-w-full">
      <Show
        when={
          (props.id && msgStatus.generatingList.includes(props.id)) ||
          (props.type === 'ans' && ansStatus.isGenerating)
        }
      >
        <Pause id={props.id} type={props.type} />
      </Show>
      <Show
        when={!props.isEmpty}
        fallback={
          <Show when={props.id && !msgStatus.generatingList.includes(props.id)}>
            <WithDrawal type={props.type} />
          </Show>
        }
      >
        <Show when={showComps()}>
          <MsgPopup type={props.type} id={props.id || ''} content={props.content} />
        </Show>
        <Show when={showCompsByUser()}>
          <MsgPopupByUser type={props.type} id={props.id || ''} content={props.content} />
        </Show>
      </Show>
      <div class={style[props.type] + ' relative m-4 rounded-2xl p-3'}>
        <Show when={meta.type === 'text'} fallback={SpecialTypeContent(meta)}>
          <div class={mdStyle[props.type] + ' markdown break-words'} innerHTML={htmlString()} />
        </Show>
        {/* 交互问题，取消使用右下角的小组件，后续可能重新使用 */}
        {/* <Show when={showComps()}>
          <div class="-mb-2 -mr-1 mt-1 flex justify-end gap-1 pl-32">
            <Show when={userData.firstTimeFor.assistantSelect}>
              <div class="absolute bottom-[10px] right-[60px] animate-bounce select-none text-[12px]">
                点击图标可以切换助手 👉
              </div>
            </Show>

            <Show when={props.botName}>
              <div
                onClick={() => {
                  userData.firstTimeFor.assistantSelect && hasFirstTimeFor('assistantSelect')
                  nav(`/assistants?type=${props.type === 'ai' ? 'chat' : props.type}`)
                }}
              >
                <CapitalIcon size={20} content={props.botName!} />
              </div>
            </Show>
            <ModelSelect position="right-1" />
          </div>
        </Show> */}
      </div>
    </div>
  )
}
