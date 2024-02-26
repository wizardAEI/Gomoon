import Plus from '@renderer/assets/icon/base/Plus'
import {
  createNewMemo,
  deleteMemo,
  getCurrentMemo,
  importMemo,
  memories,
  memoriesStatus,
  onCancelEditMemo,
  onEditMemo,
  saveMemo
} from '@renderer/store/memo'
import { For, Show, onCleanup, onMount } from 'solid-js'
import EditBox from './EditBox'
import CapitalIcon from '@renderer/components/ui/CapitalIcon'
import EditIcon from '@renderer/assets/icon/base/EditIcon'
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm'
import { useToast } from '@renderer/components/ui/Toast'
import CrossMark from '@renderer/assets/icon/base/CrossMark'
import { MemoModel } from 'src/main/models/model'
import { setSelectedMemo } from '@renderer/store/user'
import { useNavigate } from '@solidjs/router'
import UploadIcon from '@renderer/assets/icon/base/UploadIcon'
import ToolTip from '@renderer/components/ui/ToolTip'
import { cloneDeep } from 'lodash'
import DownloadIcon from '@renderer/assets/icon/base/DownloadIcon'
import { useLoading } from '@renderer/components/ui/DynamicLoading'

export default function () {
  const toast = useToast()
  const loading = useLoading()
  const nav = useNavigate()

  onMount(() => {
    onCleanup(() => {
      memories.forEach((a) => {
        onCancelEditMemo(a.id)
      })
    })
  })

  return (
    <div class="mx-auto w-full overflow-hidden lg:max-w-4xl">
      <div class="mb-5 animate-scale-down-entrance select-none p-2">
        <div class="m-4 flex gap-2">
          <div
            class="group/create relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-dark p-4"
            onClick={createNewMemo}
          >
            <Plus
              height={24}
              width={24}
              class="cursor-pointer text-gray duration-100 group-hover/create:text-active"
            />
            <span>添加记忆胶囊 💊</span>
          </div>

          <label for="import-assistants" class="flex-1">
            <div class="group/create relative flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-dark p-4">
              <DownloadIcon
                height={24}
                width={24}
                class="cursor-pointer text-gray duration-100 group-hover/create:text-active"
              />
              <span>导入记忆胶囊 💊</span>
              <input
                id="import-assistants"
                type="file"
                class="hidden"
                accept=".gomoon"
                multiple={false}
                onChange={async (e) => {
                  const file = e.target.files![0]
                  e.target.value = ''
                  if (file) {
                    console.log(file)
                    loading.show('正在导入')
                    // TODO: 观察是否需要进度功能
                    // const remove = window.api.receiveMsg(async (_, msg: string) => {
                    //   if (msg.includes('progress')) {
                    //     const progress = msg.replace(/^progress /, '')
                    //     if (progress === '100%') {
                    //       remove()
                    //       return
                    //     }
                    //     load.show(`功能初始化中...${progress}`)
                    //   }
                    // })
                    loading.hide()
                    ;(await importMemo(file.path))
                      ? toast.success('导入成功')
                      : toast.error('导入失败')
                  }
                }}
              />
            </div>
          </label>
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
                  onSave={async (m: MemoModel) => {
                    if (m.fragment.length === 0) {
                      toast.error('至少要有一个片段')
                      return
                    }
                    if (m.name === '') {
                      toast.error('名称不能为空')
                      return
                    }
                    await saveMemo({
                      id: m.id,
                      memoName: m.name,
                      introduce: m.introduce
                    })
                  }}
                />
              }
            >
              <div
                class="relative m-4 flex flex-col gap-2 rounded-2xl border-2 border-solid border-transparent bg-dark p-4 duration-150 hover:border-active"
                onClick={async () => {
                  setSelectedMemo(m.id)
                  nav(-1)
                }}
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
                    <ToolTip
                      content="导出记忆"
                      label={
                        <UploadIcon
                          height={20}
                          width={20}
                          onClick={async (e) => {
                            e.stopPropagation()
                            const data = await window.api.exportMemory(cloneDeep(m))
                            await window.api.saveFile(`${m.name}.gomoon`, data)
                          }}
                          class="cursor-pointer text-gray duration-100 hover:text-active"
                        />
                      }
                    />
                    <EditIcon
                      height={20}
                      width={20}
                      class="cursor-pointer text-gray duration-100 hover:text-active"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditMemo(m.id)
                      }}
                    />
                    <DoubleConfirm
                      label="确认删除"
                      position="-right-2 top-3"
                      onConfirm={() => deleteMemo(m.id)}
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
                <div class="">{m.introduce || '暂无介绍'}</div>
              </div>
            </Show>
          )}
        </For>
      </div>
    </div>
  )
}
