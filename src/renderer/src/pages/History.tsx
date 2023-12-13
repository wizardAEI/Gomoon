import CrossMark from '@renderer/assets/icon/base/CrossMark'
import EmptyIcon from '@renderer/assets/icon/base/EmptyIcon'
import HistoryIcon from '@renderer/assets/icon/base/HistoryIcon'
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'
import QuestionMention from '@renderer/components/ui/QuestionMention'
import { setAnswerStore } from '@renderer/store/answer'
import { histories, removeHistory } from '@renderer/store/history'
import { Msg, setMsgs } from '@renderer/store/msgs'
import { useNavigate } from '@solidjs/router'
import { For, Show } from 'solid-js'
import { HistoryModel } from 'src/main/model/model'
const map = {
  human: '我',
  ai: '助手',
  question: '问题',
  ans: '答案'
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
  function decorateContent(c: string) {
    if (c.length > 50) {
      return c.slice(0, 50) + ' ......'
    }
    return c
  }

  return (
    <div class="pb-18 flex h-full flex-col overflow-auto pt-8">
      <Show
        when={histories.length}
        fallback={
          <div class="relative m-4 flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150">
            <EmptyIcon height={50} class="text-gray" />
            <span class="text-gray">暂无历史</span>
          </div>
        }
      >
        <div class="mx-5 flex select-none items-center gap-1 text-lg  text-text1">
          <HistoryIcon width={20} height={20} /> <span class="font-medium">对话历史</span>{' '}
        </div>
        <For each={histories}>
          {(h) => (
            <div
              class="relative m-4 flex cursor-pointer flex-col gap-2 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150 hover:border-active"
              onClick={() => {
                if (h.type === 'ans') {
                  setAnswerStore('question', h.contents[0].content)
                  setAnswerStore('answer', h.contents[1].content)
                  nav('/answer')
                } else if (h.type === 'chat') {
                  setMsgs(h.contents as Msg[])
                  nav('/chat')
                }
              }}
            >
              <div class="absolute right-2 top-1 flex items-center gap-3">
                <DoubleConfirm
                  label="确认删除"
                  position="right-[-10px] top-[-42px]"
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
                {(c) => {
                  return (
                    <div class="flex flex-col gap-1">
                      <span>
                        {map[c.role]}: {decorateContent(c.content)}
                      </span>
                      <div class="border-b-0 border-t border-dashed border-gray"></div>
                    </div>
                  )
                }}
              </For>
            </div>
          )}
        </For>
      </Show>
    </div>
  )
}
