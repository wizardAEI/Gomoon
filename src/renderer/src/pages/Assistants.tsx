import CrossMark from '@renderer/assets/icon/base/CrossMark'
import EditIcon from '@renderer/assets/icon/base/EditIcon'
import Plus from '@renderer/assets/icon/base/Plus'
import CapitalIcon from '@renderer/components/ui/CapitalIcon'
import {
  assistants,
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat
} from '@renderer/store/assistants'
import { setSelectedAssistantForAns, setSelectedAssistantForChat } from '@renderer/store/user'
import { useSearchParams } from '@solidjs/router'
import { For, createMemo } from 'solid-js'

export default function () {
  const [{ type }, _] = useSearchParams()
  const as = createMemo(() => assistants.filter((a) => a.type === type))
  return (
    <div class="animate-scale-down-entrance mb-5 select-none p-2">
      <div
        class="dark-theme relative m-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-dark p-4"
        onClick={() => {}}
      >
        <Plus
          height={30}
          width={30}
          class="cursor-pointer text-gray duration-100 hover:text-active"
        />
        <span>创建一个属于你的助手</span>
      </div>
      <For each={as()}>
        {(a) => (
          <div
            class="dark-theme relative m-4 flex flex-col gap-2 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150 hover:border-active"
            onClick={() => {
              switch (type) {
                case 'ans':
                  setSelectedAssistantForAns(a.id)
                  break
                case 'chat':
                  setSelectedAssistantForChat(a.id)
                  break
                default:
                  break
              }
            }}
          >
            <div class="flex items-center">
              <div class="flex flex-1 items-center gap-2">
                <CapitalIcon
                  size={26}
                  content={a.name}
                  bg={
                    getCurrentAssistantForAnswer()?.id === a.id ||
                    getCurrentAssistantForChat()?.id === a.id
                      ? 'purple'
                      : 'gray'
                  }
                  hiddenTiptop
                />
                <div class="font-medium">{a.name}</div>
              </div>
              <div class="flex h-6 gap-1">
                <EditIcon
                  height={20}
                  width={20}
                  class="cursor-pointer text-gray duration-100 hover:text-active"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                />
                <CrossMark
                  height={20}
                  width={20}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  class="cursor-pointer text-gray duration-100 hover:text-active"
                />
              </div>
            </div>
            <div class="">{a.introduce ?? '暂无介绍'}</div>
          </div>
        )}
      </For>
    </div>
  )
}
