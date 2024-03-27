import { Show, createSignal } from 'solid-js'
import CopyIcon from '@renderer/assets/icon/base/CopyIcon'
import { useClipboard } from 'solidjs-use'
import SaveIcon from '@renderer/assets/icon/base/SaveIcon'
import RetryIcon from '@renderer/assets/icon/base/RetryIcon'
import { reGenAns, saveAns, stopGenAns } from '@renderer/store/answer'
import EditIcon from '@renderer/assets/icon/base/EditIcon'
import { event } from '@renderer/lib/util'
import WithdrawalIcon from '@renderer/assets/icon/base/WithdrawalICon'
import PauseIcon from '@renderer/assets/icon/base/PauseIcon'
import { saveMsgsBeforeID, stopGenMsg } from '@renderer/store/chat'
import SpeechIcon from '@renderer/assets/icon/SpeechIcon'
import TrashIcon from '@renderer/assets/icon/TrashIcon'

import { compWithTip } from '../ui/compWithTip'
import ToolTip from '../ui/ToolTip'

import { MsgTypes } from '.'

export default function MsgPopup(props: {
  id: string
  content: string
  type: MsgTypes
  onSpeak: () => void
}) {
  const [source] = createSignal('')
  const { copy } = useClipboard({ source })

  return (
    <div class="absolute left-5 top-[-10px] z-10 hidden items-center gap-1 rounded-[10px] bg-dark px-2 group-hover:flex group-hover:h-6">
      <ToolTip
        label={compWithTip((tip) => (
          <CopyIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={() => {
              copy(props.content).then(() => tip('success', '复制成功'))
            }}
          />
        ))}
        content="复制到剪贴板"
      />
      <ToolTip
        label={compWithTip((tip) => (
          <SaveIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={async () => {
              if (props.type === 'ai') {
                await saveMsgsBeforeID(props.id)
              } else if (props.type === 'ans') {
                await saveAns()
              }
              tip('success', '保存成功')
            }}
          />
        ))}
        content={`${props.type === 'ai' ? '保存此前内容' : '保存'}`}
      />
      <ToolTip
        label={
          <SpeechIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={props.onSpeak}
          />
        }
        content="朗读"
      />
      <Show when={props.type !== 'ans'}>
        <ToolTip
          label={
            <EditIcon
              height={22}
              width={22}
              class="cursor-pointer text-gray duration-100 hover:text-active"
              onClick={() => {
                event.emit('editUserMsg', props.content, props.id)
              }}
            />
          }
          content="重新编辑"
        />
      </Show>
      <ToolTip
        label={
          <RetryIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={() => {
              // 重新生成 ans 版
              if (props.type === 'ans') {
                reGenAns()
                return
              }
              // 重新生成 chat 版
              event.emit('reGenMsg', props.id)
            }}
          />
        }
        content="重新生成"
      />
    </div>
  )
}

export function MsgPopupForUser(props: {
  id: string
  content: string
  type: MsgTypes
  onRemove: () => void
}) {
  const [source] = createSignal('')
  const { copy } = useClipboard({ source })
  return (
    <div class="absolute right-5 top-[-10px] z-10 hidden items-center gap-1 rounded-[10px] bg-light px-2 group-hover:flex group-hover:h-6">
      <ToolTip
        label={
          <EditIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={() => {
              event.emit('editUserMsg', props.content, props.id)
            }}
          />
        }
        content="重新编辑"
      />
      <ToolTip
        label={
          <TrashIcon
            height={19}
            width={19}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={props.onRemove}
          />
        }
        content="删除此轮对话"
      />
      <ToolTip
        label={compWithTip(
          (tip) => (
            <CopyIcon
              height={22}
              width={22}
              class="cursor-pointer text-gray duration-100 hover:text-active"
              onClick={() => {
                copy(props.content).then(() => tip('success', '复制成功！'))
              }}
            />
          ),
          'right'
        )}
        content="复制到剪贴板"
      />
    </div>
  )
}

export function WithDrawal(props: { type: MsgTypes }) {
  return (
    <div
      class={
        props.type === 'human'
          ? 'absolute right-5 top-[-10px] z-10 hidden items-center gap-1 rounded-[10px] bg-light px-2 group-hover:flex group-hover:h-6'
          : 'absolute left-5 top-[-10px] z-10 hidden items-center gap-1 rounded-[10px] bg-dark px-2 group-hover:flex group-hover:h-6'
      }
    >
      <ToolTip
        label={
          <WithdrawalIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={() => {
              event.emit('editUserMsg', '', '')
            }}
          />
        }
        content="撤回"
        position={{
          placement: 'left'
        }}
      />
    </div>
  )
}

export function Pause(props: { id?: string; type: MsgTypes }) {
  return (
    <div class="absolute left-5 top-[-10px] z-10 hidden items-center gap-1 rounded-[10px] bg-dark px-2 group-hover:flex group-hover:h-6">
      <ToolTip
        label={
          <PauseIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={() => {
              if (props.id) {
                stopGenMsg(props.id)
              } else if (props.type === 'ans') {
                stopGenAns()
              }
            }}
          />
        }
        content="暂停"
        position={{
          placement: 'left'
        }}
      />
    </div>
  )
}
