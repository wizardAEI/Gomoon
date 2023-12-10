import CrossMark from '@renderer/assets/icon/base/CrossMark'
import EditIcon from '@renderer/assets/icon/base/EditIcon'
import Plus from '@renderer/assets/icon/base/Plus'
import Upload from '@renderer/assets/icon/base/Upload'
import CapitalIcon from '@renderer/components/ui/CapitalIcon'
import ToolTip from '@renderer/components/ui/ToolTip'
import { compWithTip } from '@renderer/components/ui/compWithTip'
import {
  assistants,
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat
} from '@renderer/store/assistants'
import { setSelectedAssistantForAns, setSelectedAssistantForChat } from '@renderer/store/user'
import { useSearchParams } from '@solidjs/router'
import { For, createSignal } from 'solid-js'

const map = {
  ans: '问答',
  chat: '聊天'
}

export default function () {
  const [{ type }, _] = useSearchParams()
  const [as, setAs] = createSignal(
    assistants
      .filter((a) => a.type === type)
      .map((a) => ({
        ...a,
        // 状态 saved editing
        status: 'saved'
      }))
  )
  console.log(as())
  return (
    <div class="animate-scale-down-entrance mb-5 select-none p-2">
      <div
        class="group/create relative m-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-dark p-4"
        onClick={() => {}}
      >
        <Plus
          height={30}
          width={30}
          class="cursor-pointer text-gray duration-100 group-hover/create:text-active"
        />
        <span>创建一个属于你的{map[type]}助手</span>
      </div>
      <For each={as()}>
        {(a) => (
          <div
            class="relative m-4 flex flex-col gap-2 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150 hover:border-active"
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
                      ? 'active-gradient'
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
                <ToolTip
                  label={compWithTip((tip) => (
                    <Upload
                      height={20}
                      width={20}
                      class="cursor-pointer text-gray duration-100 hover:text-active"
                      onClick={(e) => {
                        e.stopPropagation()
                        tip('fail', '没做捏💦')
                      }}
                    />
                  ))}
                  content="上传"
                  position={{
                    placement: 'top'
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
