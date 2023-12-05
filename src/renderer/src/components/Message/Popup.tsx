import { JSXElement, Show, createSignal } from 'solid-js'
import ToolTip from '../ui/ToolTip'
import CopyIcon from '@renderer/assets/icon/base/CopyIcon'
import { useClipboard } from 'solidjs-use'
import SaveIcon from '@renderer/assets/icon/base/SaveIcon'
import RetryIcon from '@renderer/assets/icon/base/RetryIcon'
import { reGenAns, stopGenAns } from '@renderer/store/answer'
import { MsgTypes } from '.'
import EditIcon from '@renderer/assets/icon/base/EditIcon'
import { event } from '@renderer/lib/util'
import WithdrawalIcon from '@renderer/assets/icon/base/WithdrawalICon'
import PauseIcon from '@renderer/assets/icon/base/PauseIcon'
import { stopGenMsg } from '@renderer/store/msgs'

// FEAT: 让点击可以有反馈
const compWithTip = (
  fn: (tip: (status: 'success' | 'fail', label: string) => void) => JSXElement
): JSXElement => {
  const [tipModal, setTipModal] = createSignal<{
    status: '' | 'success' | 'fail'
    label: string
  }>({
    status: '',
    label: ''
  })
  const tip = (status: 'success' | 'fail', label: string) => {
    setTipModal({
      status,
      label
    })
    setTimeout(() => {
      setTipModal({
        status: '',
        label: ''
      })
    }, 1000)
  }
  const Comp = fn(tip)
  return (
    <div class="flex">
      <Show when={tipModal().label}>
        {tipModal().status === 'success' && (
          <div class="absolute top-[-4px] h-1 animate-popup text-slate-50">
            {tipModal().label || '成功!'}
          </div>
        )}
        {tipModal().status === 'fail' && (
          <div class="absolute top-[-4px] h-1 animate-popup text-slate-50">
            {tipModal().label || '失败!'}
          </div>
        )}
      </Show>
      {Comp}
    </div>
  )
}

export default function MsgPopup(props: { id: string; content: string; type: MsgTypes }) {
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
              copy(props.content).then(() => tip('success', '复制成功！'))
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
            onClick={() => {
              tip('fail', '没做捏💦')
            }}
          />
        ))}
        content={`${props.type === 'ai' ? '自此' : ''}保存`}
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
          position={{
            placement: 'left'
          }}
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

export function MsgPopupByUser(props: { id: string; content: string; type: MsgTypes }) {
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
        position={{
          placement: 'left'
        }}
      />
      <ToolTip
        label={compWithTip((tip) => (
          <CopyIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={() => {
              copy(props.content).then(() => tip('success', '复制成功！'))
            }}
          />
        ))}
        content="复制到剪贴板"
        position={{
          placement: 'left'
        }}
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
