import { Roles } from '@renderer/lib/ai/langchain'
import { Show, createMemo } from 'solid-js'
import 'highlight.js/styles/atom-one-dark.css'
import { msgStatus, msgs } from '@renderer/store/msgs'
import MsgPopup, { MsgPopupForUser, Pause, WithDrawal } from './Popup'
import { ansStatus } from '@renderer/store/answer'
import { parseMeta } from '@renderer/lib/ai/parseString'
import SpecialTypeContent from './SpecialTypeContent'
import Md from './Md'
export type MsgTypes = Roles | 'ans' | 'question'
export const style: Record<MsgTypes, string> = {
  ai: 'bg-dark',
  human: 'bg-light',
  system: 'bg-dark',
  question: 'bg-light',
  ans: 'bg-dark'
}
export const mdStyle: Record<MsgTypes, string> = {
  ai: 'text-sm',
  ans: 'text-sm',
  human: 'text-sm text-text-dark',
  system: 'text-base select-none text-center text-base dark-theme px-4',
  question: 'text-sm text-text-dark'
}
export default function Message(props: {
  type: MsgTypes
  id?: string
  content: string
  botName?: string
  isEmpty?: boolean
}) {
  const meta = createMemo(() => {
    return parseMeta(props.content)
  })
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
        meta().type === 'text'
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
          <MsgPopupForUser type={props.type} id={props.id || ''} content={props.content} />
        </Show>
      </Show>
      <div class={style[props.type] + ' relative m-4 rounded-2xl p-3'}>
        <Show
          when={meta().type === 'text'}
          fallback={SpecialTypeContent(meta(), mdStyle[props.type])}
        >
          <Md class={mdStyle[props.type] + ' markdown break-words'} content={props.content} />
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
