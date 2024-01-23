import Plus from '@renderer/assets/icon/base/Plus'
import {
  createNewMemo,
  getCurrentMemo,
  memories,
  memoriesStatus,
  onCancelEditMemo
} from '@renderer/store/memo'
import { For, Show } from 'solid-js'
import EditBox from './EditBox'
import CapitalIcon from '@renderer/components/ui/CapitalIcon'
import EditIcon from '@renderer/assets/icon/base/EditIcon'
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'
import { useToast } from '@renderer/components/ui/Toast'
import CrossMark from '@renderer/assets/icon/base/CrossMark'
import { MemoModel } from 'src/main/models/model'

export default function () {
  const toast = useToast()
  return (
    <div class="max-w-[100%] overflow-hidden">
      <div class="mb-5 animate-scale-down-entrance select-none p-2">
        <div
          class="group/create relative m-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-dark p-4"
          onClick={createNewMemo}
        >
          <Plus
            height={30}
            width={30}
            class="cursor-pointer text-gray duration-100 group-hover/create:text-active"
          />
          <span class="text-base">添加一个记忆胶囊 💊</span>
        </div>
        <For each={memories}>
          {(m) => (
            <Show
              when={memoriesStatus[m.id] === 'saved'}
              fallback={
                <EditBox
                  memo={m}
                  onCancel={() => {
                    onCancelEditMemo(m.id)
                  }}
                  onSave={(m: MemoModel) => {
                    if (m.fragment.length === 0) {
                      toast.error('至少要有一个片段')
                      return
                    }
                    if (m.name === '') {
                      toast.error('名称不能为空')
                      return
                    }
                    window.api.saveMemory({
                      id: m.id,
                      memoName: m.name
                    })
                  }}
                />
              }
            >
              <div
                class="relative m-4 flex flex-col gap-2 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150 hover:border-active"
                onClick={async () => {}}
              >
                <div class="flex items-center">
                  <div class="flex flex-1 items-center gap-2">
                    <CapitalIcon
                      size={26}
                      content={m.name}
                      bg={getCurrentMemo()?.id === m.id ? 'bg-active-gradient' : 'bg-gray'}
                      hiddenTiptop
                    />
                    <div class="font-medium">{m.name}</div>
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
                    <DoubleConfirm
                      label="确认删除"
                      position="right-[-10px] top-[-46px]"
                      onConfirm={() => {}}
                      preConfirm={() => {
                        const canDel = m.id !== getCurrentMemo()?.id
                        if (!canDel) {
                          toast.error('无法删除使用中的记忆胶囊')
                        }
                        return canDel
                      }}
                    >
                      <CrossMark
                        height={20}
                        width={20}
                        class="cursor-pointer text-gray duration-100 hover:text-active"
                      />
                    </DoubleConfirm>
                  </div>
                </div>
                <div class="">{m.introduce ?? '暂无介绍'}</div>
              </div>
            </Show>
          )}
        </For>
      </div>
    </div>
  )
}
