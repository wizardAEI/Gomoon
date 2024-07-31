import { JSXElement, For, Show, createSignal, onMount, onCleanup } from 'solid-js'
import CopyIcon from '@renderer/assets/icon/base/CopyIcon'
import { useClipboard } from 'solidjs-use'
import EditIcon from '@renderer/assets/icon/base/EditIcon'
import { event } from '@renderer/lib/util'
import WithdrawalIcon from '@renderer/assets/icon/base/WithdrawalICon'
import PauseIcon from '@renderer/assets/icon/base/PauseIcon'
import { stopGenMsg } from '@renderer/store/chat'
import TrashIcon from '@renderer/assets/icon/TrashIcon'
import { stopGenAns } from '@renderer/store/answer'
import { reGenAns, saveAns } from '@renderer/store/answer'
import RetryIcon from '@renderer/assets/icon/base/RetryIcon'
import SpeechIcon from '@renderer/assets/icon/SpeechIcon'
import SaveIcon from '@renderer/assets/icon/base/SaveIcon'
import CollectionIcon from '@renderer/assets/icon/CollectionIcon'
import { addCollection, collections, createCollection } from '@renderer/store/collection'
import EmptyIcon from '@renderer/assets/icon/base/EmptyIcon'

import { useToast } from '../ui/Toast'
import ScrollBox from '../ScrollBox'
import { compWithTip } from '../ui/compWithTip'
import ToolTip from '../ui/ToolTip'

import { MsgTypes } from '.'

export function PopupContainer(props: {
  children: JSXElement
  pos?: 'left' | 'right' | 'top-left'
}) {
  const posDict = {
    left: '-bottom-7 left-1',
    'top-left': 'left-1 -top-7',
    right: '-bottom-7 right-1'
  }
  return (
    <div
      class={`absolute flex h-[26px] items-center gap-3 rounded-[10px] px-1 opacity-0 duration-200 group-hover:opacity-100 ${props.pos && posDict[props.pos]}`}
    >
      {props.children}
    </div>
  )
}

export function MsgPopupContents(props: {
  id: string
  content: string
  type: MsgTypes
  onSpeak: () => void
}) {
  const [source] = createSignal('')
  const { copy } = useClipboard({ source })
  const toast = useToast()
  return (
    <>
      {' '}
      <ToolTip
        label={compWithTip((tip) => (
          <CopyIcon
            height={20}
            width={20}
            class="cursor-pointer text-gray-pro duration-100 hover:text-active"
            onClick={() => {
              copy(props.content).then(() => tip('success', '复制成功'))
            }}
          />
        ))}
        content="复制到剪贴板"
        position={{
          placement: 'bottom'
        }}
      />
      <ToolTip
        label={
          <CollectionIcon
            height={20}
            width={20}
            class="cursor-pointer text-gray-pro duration-100 hover:text-active"
            onClick={() => {
              toast
                .modal(
                  (option) => {
                    const [addNewCollection, setAddNewCollection] = createSignal(false)
                    const [collectionName, setCollectionName] = createSignal('')
                    return (
                      <div class="flex w-[80vw] max-w-xl flex-col gap-4 p-1">
                        <div>
                          <div class="text-lg">保存到合集</div>
                          <span class="text-xs text-text1/70">
                            保存在合适的合集中，用来记单词，记知识点，整理方案，等等!
                          </span>
                        </div>
                        <div class="flex w-full flex-col gap-2">
                          <div>现有合集</div>
                          <Show
                            when={collections.length}
                            fallback={
                              <div class="flex items-center justify-center rounded-md border-dashed border-gray p-4">
                                <EmptyIcon width={40} height={40} class="text-gray-pro" />
                              </div>
                            }
                          >
                            <div class="h-40 rounded border border-solid border-gray px-2">
                              <ScrollBox>
                                <div class="w-full py-1">
                                  <For each={collections}>
                                    {(c) => {
                                      return (
                                        <div class="py-[2px] pr-1">
                                          <div
                                            class={
                                              'flex cursor-pointer justify-between rounded-md px-2 py-1 hover:bg-active hover:text-text-active ' +
                                              (c.name === collectionName() &&
                                                'bg-active text-text-active')
                                            }
                                            onClick={() => {
                                              setCollectionName(c.name)
                                              setAddNewCollection(false)
                                            }}
                                          >
                                            <div>{c.name}</div>
                                            <div>{c.contents.length} 条数据</div>
                                          </div>
                                        </div>
                                      )
                                    }}
                                  </For>
                                </div>
                              </ScrollBox>
                            </div>
                          </Show>
                        </div>
                        <div class="flex flex-col gap-2">
                          <div class="">新合集名称</div>
                          <Show
                            when={addNewCollection()}
                            fallback={
                              <button
                                class="py-1"
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
                              <input
                                onInput={(e) => {
                                  setCollectionName(e.target.value.trim())
                                }}
                              />
                            </div>
                          </Show>
                        </div>
                        <div class="mt-1 flex w-full justify-around">
                          <button onClick={() => option.close('')}>关闭</button>
                          <button
                            onClick={() => {
                              if (!collectionName()) {
                                toast.warning('合集名称不能为空')
                                return
                              }
                              if (
                                addNewCollection() &&
                                collections.find((co) => co.name === collectionName())
                              ) {
                                toast.warning('合集名称不能重复')
                                return
                              }
                              if (addNewCollection()) {
                                createCollection(collectionName(), props.id, props.type).then(
                                  () => {
                                    toast.success('保存成功')
                                  }
                                )
                              } else {
                                addCollection(collectionName(), props.id, props.type).then(() => {
                                  toast.success('保存成功')
                                })
                              }
                              option.close('suc')
                            }}
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    )
                  },
                  {
                    mask: true,
                    position: 'top-32'
                  }
                )
                .then((res) => {
                  console.log(res)
                })
            }}
          />
        }
        content="加入合集"
        position={{
          placement: 'bottom'
        }}
      />
      <Show when={props.type === 'ans'}>
        <ToolTip
          label={compWithTip((tip) => (
            <SaveIcon
              height={20}
              width={20}
              class="cursor-pointer text-gray-pro duration-100 hover:text-active"
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
            height={20}
            width={20}
            class="cursor-pointer text-gray-pro duration-100 hover:text-active"
            onClick={props.onSpeak}
          />
        }
        content="朗读"
        position={{
          placement: 'bottom'
        }}
      />
      <Show when={props.type !== 'ans'}>
        <ToolTip
          label={
            <EditIcon
              height={20}
              width={20}
              class="cursor-pointer text-gray-pro duration-100 hover:text-active"
              onClick={() => {
                event.emit('editUserMsg', props.content, props.id)
              }}
            />
          }
          content="重新编辑"
          position={{
            placement: 'bottom'
          }}
        />
      </Show>
      <ToolTip
        label={
          <RetryIcon
            height={20}
            width={20}
            class="cursor-pointer text-gray-pro duration-100 hover:text-active"
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
        position={{
          placement: 'bottom'
        }}
      />
    </>
  )
}

export default function MsgPopup(props: {
  id: string
  content: string
  type: MsgTypes
  onSpeak: () => void
}) {
  let bottomDiv
  const [showTop, setShowTop] = createSignal(false)
  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => {
      console.log('xxxx')
      setShowTop(!entry.isIntersecting)
    })
    observer.observe(bottomDiv)
    onCleanup(() => observer.disconnect())
  })
  return (
    <>
      <Show when={showTop()}>
        <PopupContainer pos="top-left">
          <MsgPopupContents {...props} />
        </PopupContainer>
      </Show>
      <div ref={bottomDiv}>
        <PopupContainer pos="left">
          <MsgPopupContents {...props} />
        </PopupContainer>
      </div>
    </>
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
        label={compWithTip(
          (tip) => (
            <CopyIcon
              height={20}
              width={20}
              class="cursor-pointer text-gray-pro duration-100 hover:text-active"
              onClick={() => {
                copy(props.content).then(() => tip('success', '复制成功！'))
              }}
            />
          ),
          'right'
        )}
        content="复制到剪贴板"
        position={{
          placement: 'bottom'
        }}
      />
      <ToolTip
        label={
          <TrashIcon
            height={20}
            width={20}
            class="cursor-pointer text-gray-pro duration-100 hover:text-active"
            onClick={props.onRemove}
          />
        }
        content="删除此轮对话"
        position={{
          placement: 'bottom-start'
        }}
      />
      <ToolTip
        label={
          <EditIcon
            height={20}
            width={20}
            class="cursor-pointer text-gray-pro duration-100 hover:text-active"
            onClick={() => {
              event.emit('editUserMsg', props.content, props.id)
            }}
          />
        }
        content="重新编辑"
        position={{
          placement: 'bottom-start'
        }}
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
                width={20}
                class="cursor-pointer text-gray-pro duration-100 hover:text-active"
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
            height={20}
            width={20}
            class="cursor-pointer text-gray-pro duration-100 hover:text-active"
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
    <PopupContainer pos="top-left">
      <div
        onClick={() => {
          if (props.id) {
            stopGenMsg(props.id)
          } else if (props.type === 'ans') {
            stopGenAns()
          }
        }}
        class="group/pause flex min-w-12 cursor-pointer items-center rounded py-[1px] hover:bg-gray/40"
      >
        <PauseIcon
          height={20}
          width={20}
          class="cursor-pointer text-gray-pro duration-100 group-hover/pause:text-active"
        />
        <span class="text-xs text-gray-pro duration-100 group-hover/pause:text-active">暂停</span>
      </div>
    </PopupContainer>
  )
}
