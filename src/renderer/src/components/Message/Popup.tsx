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
import { stopGenMsg } from '@renderer/store/chat'
import SpeechIcon from '@renderer/assets/icon/SpeechIcon'
import TrashIcon from '@renderer/assets/icon/TrashIcon'
import CollectionIcon from '@renderer/assets/icon/CollectionIcon'

import { compWithTip } from '../ui/compWithTip'
import ToolTip from '../ui/ToolTip'
import { useToast } from '../ui/Toast'

import { MsgTypes } from '.'

export default function MsgPopup(props: {
  id: string
  content: string
  type: MsgTypes
  onSpeak: () => void
}) {
  const [source] = createSignal('')
  const { copy } = useClipboard({ source })
  const toast = useToast()
  return (
    <div class="absolute -top-4 left-5 z-10 hidden items-center gap-1 rounded-xl bg-dark px-2 group-hover:flex group-hover:h-7">
      <ToolTip
        label={compWithTip((tip) => (
          <CopyIcon
            height={22}
            width={22}
            class="cursor-pointer text-gray duration-100 hover:fill-active"
            onClick={() => {
              copy(props.content).then(() => tip('success', '复制成功'))
            }}
          />
        ))}
        content="复制到剪贴板"
      />
      <ToolTip
        label={
          <CollectionIcon
            height={19}
            width={19}
            class="cursor-pointer text-gray duration-100 hover:text-active"
            onClick={() => {
              toast
                .modal(
                  (option) => {
                    const [addNewCollection, setAddNewCollection] = createSignal(false)
                    const [collectionName, setCollectionName] = createSignal('')
                    return (
                      <div class="flex w-64 flex-col gap-4 p-1">
                        保存到合集
                        <div onClick={() => setAddNewCollection(false)}>现有合集</div>
                        <Show
                          when={addNewCollection()}
                          fallback={
                            <button
                              class="py-1 text-white hover:text-opacity-70"
                              onClick={() => {
                                setCollectionName('')
                                setAddNewCollection(true)
                              }}
                            >
                              添加新合集
                            </button>
                          }
                        >
                          <div class="flex items-center gap-3">
                            <div class="">新合集名称</div>
                            <div>
                              <input
                                onInput={(e) => {
                                  setCollectionName(e.target.value)
                                }}
                              />
                            </div>
                          </div>
                        </Show>
                        <div class="flex w-full justify-around">
                          <button onClick={() => option.close('')}>关闭</button>
                          <button
                            onClick={() => {
                              if (!collectionName()) {
                                toast.warning('合集名称不能为空')
                              }
                            }}
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    )
                  },
                  {
                    mask: true
                  }
                )
                .then((type) => {
                  console.log(type)
                })
            }}
          />
        }
        content="加入合集"
      />
      <Show when={props.type === 'ans'}>
        <ToolTip
          label={compWithTip((tip) => (
            <SaveIcon
              height={22}
              width={22}
              class="cursor-pointer text-gray duration-100 hover:text-active"
              // eslint-disable-next-line solid/reactivity
              onClick={async () => {
                await saveAns()
                tip('success', '保存成功')
              }}
            />
          ))}
          content="保存问答记录"
        />
      </Show>
      <ToolTip
        label={
          <SpeechIcon
            height={22}
            width={22}
            class="cursor-pointer fill-gray duration-100 hover:fill-active"
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
    <div class="absolute -top-4 right-5 z-10 hidden items-center gap-1 rounded-xl bg-light px-2 group-hover:flex group-hover:h-7">
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
    </div>
  )
}

export function MsgPopupForSpecialContent(props: { type: MsgTypes; onRemove: () => void }) {
  return (
    <Show when={props.type === 'human'}>
      <div class="absolute -top-4 right-5 z-10 hidden items-center gap-1 rounded-xl bg-light px-2 group-hover:flex group-hover:h-7">
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
      </div>
    </Show>
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
    </div>
  )
}

export function Pause(props: { id?: string; type: MsgTypes }) {
  return (
    <div class="absolute -top-4 left-5 z-10 hidden items-center gap-1 rounded-[10px] bg-dark px-2 group-hover:flex group-hover:h-7">
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
    </div>
  )
}
