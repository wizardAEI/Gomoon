import EmptyIcon from '@renderer/assets/icon/base/EmptyIcon'
import Md from '@renderer/components/Message/Md'
import { parseDisplayArr } from '@renderer/lib/ai/parseString'
import { collections, removeCollection, updateCollection } from '@renderer/store/collection'
import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js'
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'
import { useToast } from '@renderer/components/ui/Toast'
import WarningIcon from '@renderer/assets/icon/base/Toast/WarningIcon'
import CrossMarkRound from '@renderer/assets/icon/base/CrossMarkRound'

import SpecialTypeContent from './SpecialTypeContent'

const map = {
  human: '我：',
  ai: '助手：',
  question: '问题：',
  ans: '答案：',
  system: '系统：'
}

export default function Collection(props: { searchText: string }) {
  const toast = useToast()
  const filteredCollections = createMemo(() => {
    return collections.filter((c) => c.name.includes(props.searchText))
  })
  return (
    <div class="w-full px-1 lg:max-w-4xl">
      <Show
        when={collections.length}
        fallback={
          <div class="relative m-auto flex h-40 w-full select-none flex-col items-center justify-center gap-3 rounded-2xl bg-dark p-5 duration-150">
            <EmptyIcon height={50} class="text-gray" />
            <span class="text-sm text-gray">暂无合集</span>
          </div>
        }
      >
        <For each={filteredCollections()}>
          {(c) => {
            const [expandAll, setCanExpandAll] = createSignal(true)
            return (
              <div class="my-3">
                <div
                  class={`relative flex w-full items-center bg-dark-plus px-2 pb-1 pt-[6px] ${expandAll() ? 'rounded-t-lg' : 'rounded-lg'}`}
                >
                  <span class="text-base">{c.name}</span>
                  <div
                    class="cursor-pointer pl-2 text-gray hover:text-active"
                    onClick={() => setCanExpandAll(!expandAll())}
                  >
                    {expandAll() ? '⏫ 收起所有' : '⏬ 展开所有'}
                  </div>
                  <div class=" absolute -right-1 -top-2">
                    <CrossMarkRound
                      height={22}
                      width={22}
                      class="cursor-pointer text-gray duration-100 hover:text-active"
                      onClick={() => {
                        toast
                          .confirm(
                            <div class="flex items-center gap-1">
                              <WarningIcon width={24} height={24} class="text-warning" />
                              确定删除合集所有内容吗？
                            </div>,
                            {
                              mask: true
                            }
                          )
                          .then((res) => {
                            if (res) {
                              removeCollection(c.id)
                            }
                          })
                      }}
                    />
                  </div>
                </div>
                <Show when={expandAll()}>
                  <div class="mb-2 flex flex-col rounded-b-lg bg-dark px-2 py-1">
                    <For each={c.contents}>
                      {(cons, index) => {
                        const [canExpand, setCanExpand] = createSignal(false)
                        const [expand, setExpand] = createSignal(false)
                        return (
                          <div class="relative mb-2 rounded-md border border-dashed border-gray p-1">
                            <div class="absolute -right-2 -top-2 z-20">
                              <DoubleConfirm
                                label="确认删除"
                                position="-right-2 top-3"
                                onConfirm={() => {
                                  updateCollection(c.id, index())
                                }}
                              >
                                <div class="flex">
                                  <CrossMarkRound
                                    height={18}
                                    width={18}
                                    class="cursor-pointer text-gray duration-100 hover:text-active"
                                  />
                                </div>
                              </DoubleConfirm>
                            </div>

                            <div
                              ref={(dom) => {
                                const observer = new ResizeObserver((e) => {
                                  const d = e[0]
                                  if (d.target.clientHeight === 160) {
                                    setCanExpand(true)
                                  }
                                })
                                observer.observe(dom)
                                onCleanup(() => observer.disconnect())
                              }}
                              class={expand() ? '' : 'max-h-40 overflow-auto'}
                            >
                              <For each={cons}>
                                {(con) => {
                                  const meta = parseDisplayArr(con.content)
                                  return (
                                    <For each={meta}>
                                      {(m, index) => {
                                        return (
                                          <>
                                            {index() === 0 && (
                                              <div class="mb-1 font-bold">{map[con.role]}</div>
                                            )}
                                            {m.type === 'text' ? (
                                              <Md class="text-sm" content={m.content} />
                                            ) : (
                                              // eslint-disable-next-line solid/reactivity
                                              SpecialTypeContent(m, true)
                                            )}
                                          </>
                                        )
                                      }}
                                    </For>
                                  )
                                }}
                              </For>
                            </div>
                            <Show when={canExpand()}>
                              <div
                                onClick={() => {
                                  setExpand(!expand())
                                }}
                                class="w-full"
                              >
                                <button class="w-full">{expand() ? '⏫ 收起' : '⏬ 展开'}</button>
                              </div>
                            </Show>
                          </div>
                        )
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            )
          }}
        </For>
      </Show>
    </div>
  )
}
