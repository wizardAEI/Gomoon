import EmptyIcon from '@renderer/assets/icon/base/EmptyIcon'
import HistoryIcon from '@renderer/assets/icon/base/HistoryIcon'
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'
import { parseDisplayArr } from '@renderer/lib/ai/parseString'
import {
  historyManager,
  clearHistory,
  copyHistory,
  histories,
  removeHistory,
  starHistory
} from '@renderer/store/history'
import { useNavigate } from '@solidjs/router'
import { For, Show, createMemo, createSignal, onCleanup } from 'solid-js'
import { HistoryModel } from 'src/main/models/model'
import { Search } from '@renderer/components/ui/Search'
import SearchIcon from '@renderer/assets/icon/base/SearchIcon'
import MoreHIcon from '@renderer/assets/icon/base/MoreHIcon'
import { SegmentedControl } from '@renderer/components/ui/SegmentedControl'
import ClearIcon from '@renderer/assets/icon/base/ClearIcon'
import ToolTip from '@renderer/components/ui/ToolTip'
import StarIcon from '@renderer/assets/icon/StarIcon'
import { useToast } from '@renderer/components/ui/Toast'
import WarningIcon from '@renderer/assets/icon/base/Toast/WarningIcon'
import QuestionMention from '@renderer/components/ui/QuestionMention'
import ScrollBox from '@renderer/components/ScrollBox'
import ReturnIcon from '@renderer/assets/icon/base/ReturnIcon'
import TrashIcon from '@renderer/assets/icon/TrashIcon'
import CopyIcon from '@renderer/assets/icon/base/Duplicate'

import SpecialTypeContent from './SpecialTypeContent'
import { decorateContent } from './utils'
import Collection from './Collection'
const map = {
  human: '我：',
  ai: '助手：',
  question: '问题：',
  ans: '答案：'
}

export default function () {
  const nav = useNavigate()
  const toast = useToast()
  const [showSearchInput, setShowSearchInput] = createSignal(false)
  const [searchText, setSearchText] = createSignal('')
  const [selectType, setSelectType] = createSignal('all')
  const [showMoreBtn, setShowMoreBtn] = createSignal(false)
  const iconClass = [
    'group/btn flex cursor-pointer rounded-md p-[2px] duration-100 hover:bg-gray/20',
    'text-gray group-hover/btn:text-active'
  ]
  function sliceArr(arr: HistoryModel['contents']) {
    if (arr.length === 2) return arr
    return arr
      .slice(0, 2)
      .concat([
        {
          role: 'human',
          content: '......  ......'
        }
      ])
      .concat(arr.slice(-1))
  }

  const filteredHistory = createMemo(() => {
    let arr = histories
    if (selectType() === 'starred') arr = arr.filter((h) => h.starred)
    return arr.filter((a) => a.contents.find((c) => c.content.includes(searchText())))
  })

  return (
    <div class="relative flex h-full select-none flex-col px-3 pt-2">
      <div class="z-10 mb-3 flex select-none items-center gap-1 text-lg text-text1 lg:justify-center">
        <HistoryIcon width={20} height={20} /> <span class="text-base font-medium">历史数据</span>{' '}
        <QuestionMention content="开启新连续对话后将自动保存，当前对话将不会展示在历史中" />
      </div>
      <div class="mx-auto mb-[10px] flex min-h-8 w-full items-center justify-between gap-2 px-1 lg:max-w-4xl">
        <Show
          when={!showSearchInput()}
          fallback={
            <div
              ref={(el) => {
                const fn = (e) => {
                  if (e.target && el.contains(e.target)) {
                    e.stopPropagation()
                    return
                  }
                  setShowSearchInput(false)
                  setSearchText('')
                }
                document.addEventListener('click', fn)
                onCleanup(() => {
                  document.removeEventListener('click', fn)
                })
              }}
              class="w-full"
            >
              <Search
                placeholder="搜索...（点击其他区域返回）"
                onChange={(v) => {
                  setSearchText(v)
                }}
              />
            </div>
          }
        >
          <SegmentedControl
            defaultValue={selectType()}
            options={[
              {
                label: '全部',
                value: 'all'
              },
              {
                label: '收藏',
                value: 'starred'
              },
              {
                label: '合集',
                value: 'collection'
              }
            ]}
            onCheckedChange={(v) => setSelectType(v)}
          />
          <div class="flex gap-2">
            <Show
              when={showMoreBtn()}
              fallback={
                <>
                  <div class={iconClass[0]} onClick={() => setShowSearchInput(true)}>
                    <SearchIcon height={22} width={22} class={iconClass[1]} />
                  </div>
                  <ToolTip
                    label={
                      <div class={iconClass[0]} onClick={() => setShowMoreBtn(true)}>
                        <MoreHIcon height={22} width={22} class={iconClass[1]} />
                      </div>
                    }
                    content="更多"
                  />
                </>
              }
            >
              <>
                <Show when={selectType() !== 'collection'}>
                  <div
                    class="flex"
                    onClick={() => {
                      toast
                        .confirm(
                          <div class="flex items-center gap-1">
                            <WarningIcon width={24} height={24} class="text-warning" />
                            确定删除所有非收藏历史记录吗?
                          </div>,
                          {
                            mask: true
                          }
                        )
                        .then((res) => {
                          if (res) {
                            clearHistory()
                          }
                        })
                    }}
                  >
                    <ToolTip
                      label={
                        <div class={iconClass[0]}>
                          <ClearIcon width={22} height={22} class={iconClass[1]} />
                        </div>
                      }
                      content="清除历史记录（非收藏）"
                    />
                  </div>
                </Show>
                <ToolTip
                  label={
                    <div class={iconClass[0]} onClick={() => setShowMoreBtn(false)}>
                      <ReturnIcon width={22} height={22} class={iconClass[1]} />
                    </div>
                  }
                  content="返回"
                />
              </>
            </Show>
          </div>
        </Show>
      </div>
      <ScrollBox>
        <Show
          when={selectType() !== 'collection'}
          fallback={<Collection searchText={searchText()} />}
        >
          <div class="w-full px-1 lg:max-w-4xl">
            <Show
              when={histories.length}
              fallback={
                <div class="relative m-auto flex h-40 w-full select-none flex-col items-center justify-center gap-3 rounded-lg bg-dark p-5 duration-150">
                  <EmptyIcon height={50} class="text-gray" />
                  <span class="text-sm text-gray">暂无历史</span>
                </div>
              }
            >
              <For each={filteredHistory()}>
                {(h) => {
                  const [showMore, setShowMore] = createSignal(false)
                  return (
                    <>
                      <div class="flex w-full items-center justify-between rounded-t-lg border-0 border-b border-solid border-b-gray bg-dark-plus px-2 py-1">
                        <div class="flex items-center gap-3">
                          {h.starred && '⭐️ '}
                          {h.contents[0].role === 'question' ? '问答记录' : '对话记录'}
                        </div>
                        <Show
                          fallback={
                            <div class={iconClass[0]} onClick={() => setShowMore(true)}>
                              <MoreHIcon width={20} height={20} class={iconClass[1]} />
                            </div>
                          }
                          when={showMore()}
                        >
                          <div
                            class="flex gap-2"
                            ref={(el) => {
                              const fn = (e) => {
                                if (e.target && el.contains(e.target)) {
                                  e.stopPropagation()
                                  return
                                }
                                setShowMore(false)
                              }
                              document.addEventListener('click', fn)
                              onCleanup(() => {
                                document.removeEventListener('click', fn)
                              })
                            }}
                          >
                            <div
                              class={iconClass[0]}
                              onClick={() => {
                                h.starred ? starHistory(h.id, false) : starHistory(h.id, true)
                              }}
                            >
                              <StarIcon
                                width={20}
                                height={20}
                                class={`cursor-pointer ${h.starred ? 'text-active' : 'text-gray group-hover/btn:text-active/80'}`}
                              />
                            </div>
                            <div
                              onClick={() => {
                                copyHistory(h.id).then(() => {
                                  toast.success('拷贝成功')
                                })
                              }}
                              class={iconClass[0]}
                            >
                              <CopyIcon width={19} height={19} class={iconClass[1]} />
                            </div>
                            <DoubleConfirm
                              label="确认删除"
                              position="-right-2 top-3"
                              onConfirm={() => {
                                removeHistory(h.id)
                              }}
                            >
                              <div class={iconClass[0]}>
                                <TrashIcon
                                  height={20}
                                  width={20}
                                  class="cursor-pointer text-gray duration-100 hover:text-active"
                                />
                              </div>
                            </DoubleConfirm>
                          </div>
                        </Show>
                      </div>
                      <div
                        class="group/history-box relative mb-3 flex w-full cursor-pointer flex-col gap-2 rounded-b-lg border-2 border-solid border-transparent bg-dark p-4 pt-2 duration-150 hover:border-active lg:max-w-4xl"
                        onClick={() => {
                          historyManager.drawHistory(h)
                          h.type === 'ans' ? nav('/ans') : nav('/chat')
                        }}
                      >
                        <For each={sliceArr(h.contents)}>
                          {(c) => {
                            const meta = parseDisplayArr(c.content)
                            return (
                              <div class="flex flex-col gap-1 break-words text-sm">
                                <div>
                                  <For each={meta}>
                                    {(m, index) => {
                                      return m.type === 'text' ? (
                                        (index() === 0 ? map[c.role] || '我：' : '') +
                                          decorateContent(m.content)
                                      ) : (
                                        <>
                                          {index() === 0 && (
                                            <span class="mr-1">{map[c.role] || '我：'}</span>
                                          )}
                                          {SpecialTypeContent(m)}
                                        </>
                                      )
                                    }}
                                  </For>
                                </div>
                                <div class="border-b-0 border-t border-dashed border-gray" />
                              </div>
                            )
                          }}
                        </For>
                      </div>
                    </>
                  )
                }}
              </For>
            </Show>
          </div>
        </Show>
      </ScrollBox>
    </div>
  )
}
