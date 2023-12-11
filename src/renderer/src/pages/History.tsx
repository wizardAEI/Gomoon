import EmptyIcon from '@renderer/assets/icon/base/EmptyIcon'
import { setAnswerStore } from '@renderer/store/answer'
import { histories } from '@renderer/store/history'
import { Msg, setMsgs } from '@renderer/store/msgs'
import { useNavigate } from '@solidjs/router'
import { For, Show } from 'solid-js'
import { HistoryModel } from 'src/main/model/model'

export default function () {
  function sliceArr(arr: HistoryModel['contents']) {
    if (arr.length === 2) return arr
    return arr.slice(0, 2).concat(arr.slice(-1))
  }
  const nav = useNavigate()
  return (
    <div class="flex h-full flex-col overflow-auto pb-48 pt-6">
      <Show
        when={histories.length}
        fallback={
          <div class="relative m-4 flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150">
            <EmptyIcon height={50} class="text-gray" />
            <span class="text-gray">暂无历史</span>
          </div>
        }
      >
        <For each={histories}>
          {(h) => (
            <div
              class="relative m-4 flex cursor-pointer flex-col gap-2 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150 hover:border-active"
              onClick={() => {
                if (h.type === 'ans') {
                  setAnswerStore('answer', h.contents[0].content)
                  setAnswerStore('question', h.contents[1].content)
                  nav('/answer')
                } else if (h.type === 'chat') {
                  setMsgs(h.contents as Msg[])
                  nav('/chat')
                }
              }}
            >
              <For each={sliceArr(h.contents)}>{(c) => <span class="">{c.content}</span>}</For>
            </div>
          )}
        </For>
      </Show>
    </div>
  )
}
