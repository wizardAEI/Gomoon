import { JSXElement, Show, createSignal } from 'solid-js'
import CopyIcon from '@renderer/assets/icon/base/CopyIcon'
import { useClipboard } from 'solidjs-use'
import EditIcon from '@renderer/assets/icon/base/EditIcon'
import { event } from '@renderer/lib/util'
import WithdrawalIcon from '@renderer/assets/icon/base/WithdrawalICon'
import PauseIcon from '@renderer/assets/icon/base/PauseIcon'
import { stopGenMsg } from '@renderer/store/chat'
import TrashIcon from '@renderer/assets/icon/TrashIcon'
import { stopGenAns } from '@renderer/store/answer'

import { compWithTip } from '../ui/compWithTip'
import ToolTip from '../ui/ToolTip'

import { MsgTypes } from '.'

export function PopupContainer(props: { children: JSXElement; pos?: 'left' | 'right' }) {
  return (
    <div
      class={
        props.pos === 'right'
          ? 'shadow-s-light border-light-gray absolute -top-2 right-4 z-10 flex h-[26px] items-center gap-1 rounded-[10px] border border-solid bg-light px-1 opacity-0 duration-200 group-hover:opacity-100'
          : 'shadow-s-dark absolute -top-2 left-4 z-10 flex h-[26px] items-center gap-1 rounded-[10px] border border-solid border-dark-con bg-dark px-1 opacity-0 duration-200 group-hover:opacity-100'
      }
    >
      {props.children}
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
    <PopupContainer pos="right">
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
            width={22}
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
              class="cursor-pointer text-gray duration-100 hover:fill-active"
              onClick={() => {
                copy(props.content).then(() => tip('success', '复制成功！'))
              }}
            />
          ),
          'right'
        )}
        content="复制到剪贴板"
      />
    </PopupContainer>
  )
}

export function MsgPopupForSpecialContent(props: { type: MsgTypes; onRemove: () => void }) {
  return (
    <Show when={props.type === 'human'}>
      <PopupContainer pos="right">
        <div class="flex">
          <ToolTip
            label={
              <TrashIcon
                height={18}
                width={22}
                class="cursor-pointer text-gray duration-100 hover:text-active"
                onClick={props.onRemove}
              />
            }
            content="删除此轮对话"
          />
        </div>
      </PopupContainer>
    </Show>
  )
}

export function WithDrawal(props: { type: MsgTypes }) {
  return (
    <PopupContainer pos={props.type === 'human' ? 'right' : 'left'}>
      <ToolTip
        label={
          <WithdrawalIcon
            height={22}
            width={22}
            class="cursor-pointer fill-gray duration-100 hover:fill-active"
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
    </PopupContainer>
  )
}

export function Pause(props: { id?: string; type: MsgTypes }) {
  return (
    <PopupContainer pos={props.type === 'human' ? 'right' : 'left'}>
      <ToolTip
        label={
          <PauseIcon
            height={22}
            width={22}
            class="cursor-pointer fill-gray duration-100 hover:fill-active"
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
    </PopupContainer>
  )
}
