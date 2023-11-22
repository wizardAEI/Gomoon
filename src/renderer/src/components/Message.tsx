import { Roles } from '@renderer/lib/langchain'
import { splitProps } from 'solid-js'
import { SolidMarkdown } from 'solid-markdown'

type MsgTypes = Roles | 'ans' | 'question'

export default function Message(props: { type: MsgTypes; content: string }) {
  const style: Record<MsgTypes, string> = {
    ai: 'bg-gradient-to-br from-[#4c4d51] to-[#404144]',
    human: 'bg-gradient-to-br from-[#fffffe] to-[#d9d8d5]',
    system: 'bg-gradient-to-br from-[#62c0da] to-[#53a1b8]',
    question: 'bg-gradient-to-br from-[#62c0da] to-[#53a1b8]',
    ans: 'bg-gradient-to-br from-[#4c4d51] to-[#404144]'
  }
  const mdStyle: Record<MsgTypes, string> = {
    ai: 'text-sm dark-theme',
    ans: 'text-sm dark-theme',
    human: 'text-sm',
    system: 'select-none text-center text-base',
    question: 'text-sm'
  }
  return (
    <div class={style[props.type] + ' m-4 rounded-2xl p-4 '}>
      <SolidMarkdown children={props.content} class={mdStyle[props.type] + ' solid-markdown'} />
    </div>
  )
}
