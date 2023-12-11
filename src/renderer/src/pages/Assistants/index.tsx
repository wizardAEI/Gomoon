import CrossMark from '@renderer/assets/icon/base/CrossMark'
import EditIcon from '@renderer/assets/icon/base/EditIcon'
import Plus from '@renderer/assets/icon/base/Plus'
import Upload from '@renderer/assets/icon/base/Upload'
import CapitalIcon from '@renderer/components/ui/CapitalIcon'
import ToolTip from '@renderer/components/ui/ToolTip'
import { compWithTip } from '@renderer/components/ui/compWithTip'
import {
  assistants,
  assistantsStatus,
  createNewAssistant,
  deleteAssistant,
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat,
  onCancelEditAssistant,
  onEditAssistant,
  saveAssistant
} from '@renderer/store/assistants'
import { setSelectedAssistantForAns, setSelectedAssistantForChat } from '@renderer/store/user'
import { useNavigate, useSearchParams } from '@solidjs/router'
import { For, Show, onCleanup, onMount } from 'solid-js'
import EditBox from './EditBox'
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'

const map = {
  ans: '问答',
  chat: '聊天'
}

export default function () {
  const [{ type }, _] = useSearchParams()
  const nav = useNavigate()
  function createAssistant() {
    createNewAssistant(type === 'chat' ? type : 'ans')
  }

  onMount(() => {
    onCleanup(() => {
      // 删除没有创建完的助手，关闭所有未编辑的助手
      assistants.forEach((a) => {
        onCancelEditAssistant(a.id)
      })
    })
  })

  return (
    <div class="mb-5 animate-scale-down-entrance select-none p-2">
      <div
        class="group/create relative m-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-dark p-4"
        onClick={() => {
          createAssistant()
        }}
      >
        <Plus
          height={30}
          width={30}
          class="cursor-pointer text-gray duration-100 group-hover/create:text-active"
        />
        <span>创建一个属于你的{map[type]}助手</span>
      </div>
      <For each={assistants.filter((a) => a.type === type)}>
        {(a) => (
          <Show
            when={assistantsStatus[a.id] === 'saved'}
            fallback={
              <EditBox
                assistant={a}
                onCancel={() => {
                  onCancelEditAssistant(a.id)
                }}
                onSave={saveAssistant}
              />
            }
          >
            <div
              class="relative m-4 flex flex-col gap-2 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150 hover:border-active"
              onClick={async () => {
                switch (type) {
                  case 'ans':
                    await setSelectedAssistantForAns(a.id)
                    nav('/answer')
                    break
                  case 'chat':
                    await setSelectedAssistantForChat(a.id)
                    nav('/chat')
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
                      onEditAssistant(a.id)
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
                  <DoubleConfirm
                    label="确认删除"
                    position="right-[-10px] top-[-42px]"
                    onConfirm={() => deleteAssistant(a.id)}
                  >
                    <CrossMark
                      height={20}
                      width={20}
                      class="cursor-pointer text-gray duration-100 hover:text-active"
                    />
                  </DoubleConfirm>
                </div>
              </div>
              <div class="">{a.introduce ?? '暂无介绍'}</div>
            </div>
          </Show>
        )}
      </For>
    </div>
  )
}
