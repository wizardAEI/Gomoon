import { Show, For, createSignal } from 'solid-js'
import { reGenAns, saveAns } from '@renderer/store/answer'
import RetryIcon from '@renderer/assets/icon/base/RetryIcon'
import SpeechIcon from '@renderer/assets/icon/SpeechIcon'
import SaveIcon from '@renderer/assets/icon/base/SaveIcon'
import CollectionIcon from '@renderer/assets/icon/CollectionIcon'
import { addCollection, collections, createCollection } from '@renderer/store/collection'
import EmptyIcon from '@renderer/assets/icon/base/EmptyIcon'
import { useClipboard } from 'solidjs-use'
import CopyIcon from '@renderer/assets/icon/base/CopyIcon'
import { event } from '@renderer/lib/util'
import EditIcon from '@renderer/assets/icon/base/EditIcon'

import { useToast } from '../ui/Toast'
import { compWithTip } from '../ui/compWithTip'
import ToolTip from '../ui/ToolTip'
import Select from '../ui/Select'
import ScrollBox from '../ScrollBox'

import { MsgTypes } from '.'
export default function MsgComp(props: {
  id: string
  content: string
  type: MsgTypes
  onSpeak: () => void
}) {
  const [source] = createSignal('')
  const { copy } = useClipboard({ source })
  const toast = useToast()
  return (
    <div class="flex flex-col">
      <div class="my-2 border-0 border-b border-solid border-gray/80" />
      <div class="flex">
        <div class="flex flex-1 gap-1">
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
                height={22}
                width={22}
                class="cursor-pointer text-gray duration-100 hover:text-active"
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
                                    <EmptyIcon width={40} height={40} class="text-gray" />
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
                                    addCollection(collectionName(), props.id, props.type).then(
                                      () => {
                                        toast.success('保存成功')
                                      }
                                    )
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
        </div>
        <div class="ml-1 flex gap-1">
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
      </div>
    </div>
  )
}
