import Card from '@renderer/components/ui/Card'
import {
  settingStore,
  setIsOnTop,
  setModels,
  updateModelsToFile,
  setSendWithCmdOrCtrl,
  setCanMultiCopy,
  setQuicklyWakeUpKeys
} from '../store/setting'
import Switch from '@renderer/components/ui/SwitchItem'
import Expand from '@renderer/components/ui/Expand'
import EditInput from '@renderer/components/ui/EditInput'
import { onCleanup, onMount } from 'solid-js'
import { unwrap } from 'solid-js/store'
export default function Setting() {
  onMount(() => {
    onCleanup(() => {
      updateModelsToFile()
    })
  })
  return (
    <div class="flex h-full select-none flex-col gap-3 p-4">
      <Card title="模型引擎配置" noPadding>
        <Expand title="ChatGPT系列">
          <EditInput
            label="apiKey"
            value={settingStore.models.OpenAI.apiKey}
            onSave={(v) => {
              const m = unwrap(settingStore.models)
              m.OpenAI.apiKey = v
              setModels(m)
            }}
          />
          <EditInput
            label="baseURL"
            value={settingStore.models.OpenAI.baseURL}
            onSave={(v) => {
              const m = unwrap(settingStore.models)
              m.OpenAI.baseURL = v
              setModels(m)
            }}
          />
        </Expand>
        <Expand title="文心系列">
          <EditInput
            label="apiKey"
            value={settingStore.models.BaiduWenxin.apiKey}
            onSave={(v) => {
              const m = unwrap(settingStore.models)
              m.BaiduWenxin.apiKey = v
              setModels(m)
            }}
          />
          <EditInput
            value={settingStore.models.BaiduWenxin.secretKey}
            label="secretKey"
            onSave={(v) => {
              const m = unwrap(settingStore.models)
              m.BaiduWenxin.secretKey = v
              setModels(m)
            }}
          />
        </Expand>
      </Card>
      <Card title="应用设置">
        <div class="flex flex-col gap-2">
          <Switch
            label="是否将应用置顶"
            hint="置顶后也可以通过唤起快捷键隐藏和唤起"
            checked={settingStore.isOnTop}
            onCheckedChange={setIsOnTop}
          />
          <Switch
            label="双击复制进行问答"
            hint="通过快速连按复制唤起 Gomoon 并问答（更改后重启生效）"
            checked={settingStore.canMultiCopy}
            onCheckedChange={setCanMultiCopy}
          />
          <div class="item-center flex justify-between gap-3">
            <span class="h-6">唤起应用快捷键</span>
            <input
              class="max-w-[112px] px-2 py-[1px] text-center"
              value={settingStore.quicklyWakeUpKeys}
              onKeyDown={(e) => {
                e.preventDefault()
                console.log(
                  'key ',
                  e.key,
                  '\n altKey:',
                  e.altKey,
                  ' shiftKey:',
                  e.shiftKey,
                  ' metaKey:',
                  e.metaKey,
                  e.ctrlKey
                )
                // 如果没有按下 Shift, Meta, Alt, Control 等特殊键, 则返回
                if (!e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                  return false
                }
                let SpecialKey = ''
                e.altKey && (SpecialKey += 'Alt+')
                e.shiftKey && (SpecialKey += 'Shift+')
                if (e.metaKey) {
                  if (navigator.userAgent.includes('Mac')) {
                    SpecialKey += 'Cmd+'
                  } else {
                    SpecialKey += 'Super+'
                  }
                }
                e.ctrlKey && (SpecialKey += 'Control+')

                // 判断是否是 Shift, Meta, Alt, Control 等特殊键, 如果是则阻止默认事件
                if (
                  e.key === 'Shift' ||
                  e.key === 'Meta' ||
                  e.key === 'Alt' ||
                  e.key === 'Control'
                ) {
                  return false
                }
                let key = e.key
                // 空格
                if (key === ' ') {
                  key = 'Space'
                }
                if (key.length === 1) {
                  key = key.toUpperCase()
                }
                setQuicklyWakeUpKeys(SpecialKey + key)
                e.currentTarget.blur()
                return true
              }}
            />
          </div>
          <Switch
            label="使用 Cmd/Ctrl+Enter 发起对话"
            hint="关闭后使用 Enter 发起对话"
            checked={settingStore.sendWithCmdOrCtrl}
            onCheckedChange={setSendWithCmdOrCtrl}
          />
        </div>
      </Card>
    </div>
  )
}
