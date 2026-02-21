import EditIcon from '@renderer/assets/icon/base/EditIcon'
import Plus from '@renderer/assets/icon/base/Plus'
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
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'
import { useToast } from '@renderer/components/ui/Toast'
import TrashIcon from '@renderer/assets/icon/TrashIcon'
import BotIcon from '@renderer/components/ui/BotIcon'
import InuseIcon from '@renderer/assets/icon/InuseIcon'
import Md from '@renderer/components/Message/Md'
import BrowserIcon from '@renderer/assets/icon/BrowserIcon'

import EditBox from './EditBox'

const map = {
  ans: '问答',
  chat: '聊天'
}

const iconClass = [
  'group/btn flex cursor-pointer rounded-md p-[2px] duration-100 hover:bg-gray/20',
  'text-gray group-hover/btn:text-active'
]

export default function () {
  const [{ type }, _] = useSearchParams()
  const toast = useToast()
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
    <div class="mx-auto w-full overflow-hidden lg:max-w-4xl">
      <div class="mb-5 animate-scale-down-entrance select-none p-2">
        <div class="mx-2 my-4 flex gap-2">
          <div
            class="group/create relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-dark py-4"
            onClick={() => {
              createAssistant()
            }}
          >
            <Plus
              height={24}
              width={24}
              class="cursor-pointer text-gray duration-100 group-hover/create:text-active"
            />
            <span class="text-base">创建{type ? map[type] : ''}助手</span>
          </div>
          <div
            class="group/create relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-dark py-4"
            onClick={() => {
              window.open('https://gomoon.top/explore')
            }}
          >
            <BrowserIcon
              height={24}
              width={24}
              class="cursor-pointer text-gray duration-100 group-hover/create:text-active"
            />
            <span class="text-base">探索更多助手</span>
          </div>
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
                class="relative mx-2 my-4 flex flex-col gap-3 rounded-2xl border-2 border-solid border-transparent bg-dark p-3 duration-150 hover:border-active"
                onClick={async () => {
                  switch (type) {
                    case 'ans':
                      await setSelectedAssistantForAns(a.id)
                      nav('/ans')
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
                <Show
                  when={
                    getCurrentAssistantForAnswer()?.id === a.id ||
                    getCurrentAssistantForChat()?.id === a.id
                  }
                >
                  <InuseIcon
                    width={34}
                    height={34}
                    class="absolute -right-[2px] -top-[2px] text-active"
                  />
                </Show>
                <div class="relative flex items-center">
                  <div class="flex flex-1 items-center gap-2">
                    <BotIcon size={26} seed={a.avatar || a.id.slice(-5)} />
                    <div class="font-medium">{a.name}</div>
                  </div>
                  <div class="flex h-6 gap-1">
                    <div
                      class={iconClass[0]}
                      onClick={(e) => {
                        onEditAssistant(a.id)
                        e.stopPropagation()
                      }}
                    >
                      <EditIcon height={20} width={20} class={iconClass[1]} />
                    </div>
                    <DoubleConfirm
                      label="确认删除"
                      position="-right-2 top-3"
                      onConfirm={() => deleteAssistant(a.id)}
                      preConfirm={() => {
                        const canDel =
                          a.id !== getCurrentAssistantForAnswer()?.id &&
                          a.id !== getCurrentAssistantForChat()?.id
                        if (!canDel) {
                          toast.error('无法删除使用中的助手')
                        }
                        return canDel
                      }}
                    >
                      <div class={iconClass[0]}>
                        <TrashIcon height={20} width={20} class={iconClass[1]} />
                      </div>
                    </DoubleConfirm>
                  </div>
                </div>
                <div class="">
                  <Md class="text-sm" content={a.introduce || '暂无介绍'} />
                </div>
              </div>
            </Show>
          )}
        </For>
      </div>
    </div>
  )
}
