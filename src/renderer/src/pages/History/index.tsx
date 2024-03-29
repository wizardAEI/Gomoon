import CrossMark from '@renderer/assets/icon/base/CrossMark'
import EmptyIcon from '@renderer/assets/icon/base/EmptyIcon'
import HistoryIcon from '@renderer/assets/icon/base/HistoryIcon'
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'
import { parseDisplayArr } from '@renderer/lib/ai/parseString'
import { setAnswerStore } from '@renderer/store/answer'
import { histories, removeHistory } from '@renderer/store/history'
import { Msg, setMsgs } from '@renderer/store/chat'
import { setSelectedAssistantForAns, setSelectedAssistantForChat } from '@renderer/store/user'
import { useNavigate } from '@solidjs/router'
import { For, Show } from 'solid-js'
import { HistoryModel } from 'src/main/models/model'

import SpecialTypeContent from './SpecialTypeContent'
import { decorateContent } from './utils'
const map = {
  human: '我:',
  ai: '助手:',
  question: '问题:',
  ans: '答案:'
}
export default function () {
  const nav = useNavigate()
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

  return (
    <div class="flex h-full select-none flex-col gap-3 px-5 pt-2">
      <div class="flex select-none items-center gap-1 text-lg text-text1 lg:justify-center">
        <HistoryIcon width={20} height={20} /> <span class="text-base font-medium">对话历史</span>{' '}
      </div>
      <Show
        when={histories.length}
        fallback={
          <div class="relative m-4 flex h-40 select-none flex-col items-center justify-center gap-3 rounded-2xl border-2 border-solid border-transparent bg-dark p-5 duration-150">
            <EmptyIcon height={50} class="text-gray" />
            <span class="text-sm text-gray">暂无历史</span>
            <span class="text-[12px] text-gray">
              &lt; 在每段回答下点击保存，即可将对话历史保存至此 &gt;
            </span>
          </div>
        }
      >
        <div class="flex w-full flex-col items-center overflow-auto">
          <For each={histories}>
            {(h) => (
              <div
                class="relative mb-3 flex w-full cursor-pointer flex-col gap-2 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150 hover:border-active lg:max-w-4xl"
                onClick={() => {
                  if (h.type === 'ans') {
                    setAnswerStore('question', h.contents[0].content)
                    setAnswerStore('answer', h.contents[1].content)
                    h.assistantId && setSelectedAssistantForAns(h.assistantId)
                    nav('/ans')
                  } else if (h.type === 'chat') {
                    setMsgs(h.contents as Msg[])
                    h.assistantId && setSelectedAssistantForChat(h.assistantId)
                    nav('/chat')
                  }
                }}
              >
                <div class="absolute right-2 top-1 z-20 flex items-center gap-3">
                  <DoubleConfirm
                    label="确认删除"
                    position="-right-2 top-3"
                    onConfirm={() => {
                      removeHistory(h.id)
                    }}
                  >
                    <CrossMark
                      height={20}
                      width={20}
                      class="cursor-pointer text-gray duration-100 hover:text-active"
                    />
                  </DoubleConfirm>
                </div>
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
                                  {index() === 0 && `${map[c.role]}`} {decorateContent(m.content)}
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
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
