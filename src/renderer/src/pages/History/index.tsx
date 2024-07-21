import CrossMark from '@renderer/assets/icon/base/CrossMark'
import EmptyIcon from '@renderer/assets/icon/base/EmptyIcon'
import HistoryIcon from '@renderer/assets/icon/base/HistoryIcon'
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'
import { parseDisplayArr } from '@renderer/lib/ai/parseString'
import { setAnswerStore } from '@renderer/store/answer'
import {
  chatHistoryTransfer,
  clearHistory,
  copyHistory,
  histories,
  removeHistory,
  starHistory
} from '@renderer/store/history'
import { Msg, setMsgs } from '@renderer/store/chat'
import { setSelectedAssistantForAns, setSelectedAssistantForChat } from '@renderer/store/user'
import { useNavigate } from '@solidjs/router'
import { For, Show, createMemo, createSignal, onCleanup } from 'solid-js'
import { HistoryModel } from 'src/main/models/model'
import { Search } from '@renderer/components/ui/Search'
import SearchIcon from '@renderer/assets/icon/base/SearchIcon'
import More2Icon from '@renderer/assets/icon/base/More2Icon'
import { SegmentedControl } from '@renderer/components/ui/SegmentedControl'
import ClearIcon from '@renderer/assets/icon/base/ClearIcon'
import CrossMarkRound from '@renderer/assets/icon/base/CrossMarkRound'
import ToolTip from '@renderer/components/ui/ToolTip'
import StarIcon from '@renderer/assets/icon/StarIcon'
import { useToast } from '@renderer/components/ui/Toast'
import WarningIcon from '@renderer/assets/icon/base/Toast/WarningIcon'
import CopyFillIcon from '@renderer/assets/icon/base/CopyFillIcon'
import QuestionMention from '@renderer/components/ui/QuestionMention'

import SpecialTypeContent from './SpecialTypeContent'
import { decorateContent } from './utils'
import Collection from './Collection'
const map = {
  human: '我:',
  ai: '助手:',
  question: '问题:',
  ans: '答案:'
}

export default function () {
  const nav = useNavigate()
  const toast = useToast()
  const [showSearchInput, setShowSearchInput] = createSignal(false)
  const [searchText, setSearchText] = createSignal('')
  const [selectType, setSelectType] = createSignal('all')
  const [showMoreBtn, setShowMoreBtn] = createSignal(false)
  const iconClass = 'cursor-pointer text-gray hover:text-active'
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
    <div class="relative flex h-full select-none flex-col px-5 pt-2">
      <div class="z-10 mb-3 flex select-none items-center gap-1 text-lg text-text1 lg:justify-center">
        <HistoryIcon width={20} height={20} /> <span class="text-base font-medium">历史数据</span>{' '}
        <QuestionMention content="开启新连续对话后将自动保存，当前对话将不会展示在历史中" />
      </div>
      <div class="mx-auto mb-[10px] flex min-h-8 w-full items-center justify-between gap-2 pl-1 pr-2 lg:max-w-4xl">
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
                  <SearchIcon
                    height={24}
                    width={24}
                    class={iconClass}
                    onClick={() => setShowSearchInput(true)}
                  />
                  <ToolTip
                    label={
                      <More2Icon
                        height={24}
                        width={24}
                        class={iconClass}
                        onClick={() => setShowMoreBtn(true)}
                      />
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
                          <div class="flex items-center gap-1 pt-4">
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
                      label={<ClearIcon width={24} height={24} class={iconClass} />}
                      content="清除历史记录（非收藏）"
                    />
                  </div>
                </Show>

                <ToolTip
                  label={
                    <CrossMarkRound
                      onClick={() => setShowMoreBtn(false)}
                      width={24}
                      height={24}
                      class={iconClass}
                    />
                  }
                  content="返回"
                />
              </>
            </Show>
          </div>
        </Show>
      </div>
      <div
        ref={(dom) => {
          dom.classList.add('scrollbar-translucent')
          dom.classList.add('scrollbar-transparent')
          let time: NodeJS.Timeout | null = null
          dom.onscrollend = () => {
            time = setTimeout(() => {
              dom.classList.add('scrollbar-translucent')
              setTimeout(() => {
                dom.classList.add('scrollbar-transparent')
              }, 1000)
            }, 2000)
          }
          dom.onscroll = () => {
            dom.classList.remove('scrollbar-translucent')
            dom.classList.remove('scrollbar-transparent')
            if (time) {
              clearTimeout(time)
            }
          }
        }}
        class="scrollbar-show -mx-2 flex w-[calc(100%+16px)] flex-col items-center"
      >
        <Show
          when={selectType() !== 'collection'}
          fallback={<Collection searchText={searchText()} />}
        >
          <div class="ml-[0.45rem] mr-[calc(100%-100vw+24px+0.45rem)] w-[calc(100vw-24px-0.9rem)] px-1 lg:max-w-4xl">
            <Show
              when={histories.length}
              fallback={
                <div class="relative m-auto flex h-40 w-full select-none flex-col items-center justify-center gap-3 rounded-2xl bg-dark p-5 duration-150">
                  <EmptyIcon height={50} class="text-gray" />
                  <span class="text-sm text-gray">暂无历史</span>
                </div>
              }
            >
              <For each={filteredHistory()}>
                {(h) => (
                  <>
                    <div class="flex w-full items-center justify-between rounded-t-2xl bg-dark-plus px-4 pt-2">
                      <div class="flex items-center gap-3 text-text2">
                        {h.contents[0].role === 'question' ? '问答记录' : '对话记录'}
                      </div>
                      <div class="flex gap-2">
                        <StarIcon
                          width={22}
                          height={22}
                          class={`cursor-pointer ${h.starred ? 'text-active' : 'text-gray hover:text-active/80'}`}
                          onClick={() => {
                            h.starred ? starHistory(h.id, false) : starHistory(h.id, true)
                          }}
                        />
                        <CopyFillIcon
                          width={21}
                          height={21}
                          class="cursor-pointer pl-[1px] pt-[1px] text-gray duration-100 hover:text-active"
                          onClick={() => {
                            copyHistory(h.id).then(() => {
                              toast.success('拷贝成功')
                            })
                          }}
                        />
                        <DoubleConfirm
                          label="确认删除"
                          position="-right-2 top-3"
                          onConfirm={() => {
                            removeHistory(h.id)
                          }}
                        >
                          <CrossMark
                            height={22}
                            width={22}
                            class="cursor-pointer text-gray duration-100 hover:text-active"
                          />
                        </DoubleConfirm>
                      </div>
                    </div>
                    <div
                      class="group/history-box relative mb-3 flex w-full cursor-pointer flex-col gap-2 rounded-b-2xl border-2 border-solid border-transparent bg-dark p-4 pt-2 duration-150 hover:border-active lg:max-w-4xl"
                      onClick={() => {
                        if (h.type === 'ans') {
                          setAnswerStore('question', h.contents[0].content)
                          setAnswerStore('answer', h.contents[1].content)
                          h.assistantId && setSelectedAssistantForAns(h.assistantId)
                          nav('/ans')
                        } else if (h.type === 'chat') {
                          chatHistoryTransfer.drawHistory(h.id)
                          setMsgs(h.contents as Msg[])
                          h.assistantId && setSelectedAssistantForChat(h.assistantId)
                          nav('/chat')
                        }
                      }}
                    >
                      <div class="absolute -left-[2px] top-0 w-[calc(100%+4px)] border-b-0 border-t border-solid border-gray group-hover/history-box:border-transparent" />
                      <For each={sliceArr(h.contents)}>
                        {(c, index) => {
                          const meta = parseDisplayArr(c.content)
                          return (
                            <div class="flex flex-col gap-1 break-words text-sm">
                              <div class={index() === 0 ? 'pr-3' : ''}>
                                <For each={meta}>
                                  {(m, index) => {
                                    return m.type === 'text' ? (
                                      <>
                                        {index() === 0 && `${map[c.role]}`}{' '}
                                        {decorateContent(m.content)}
                                      </>
                                    ) : (
                                      // eslint-disable-next-line solid/reactivity
                                      SpecialTypeContent(m, map[c.role], index())
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
                )}
              </For>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}
