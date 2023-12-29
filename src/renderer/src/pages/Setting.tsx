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
import SettingIcon from '@renderer/assets/icon/base/SettingIcon'
import groupCodeJpg from '@renderer/assets/groupcode.jpg'
import { updateStatusLabel, updateVersion } from '@renderer/store/system'
import { useLoading } from '@renderer/components/ui/DynamicLoading'
export default function Setting() {
  onMount(() => {
    onCleanup(() => {
      updateModelsToFile()
    })
  })
  const loading = useLoading()
  return (
    <div class="flex select-none flex-col gap-3 p-5">
      <div class="flex select-none items-center gap-1  text-lg text-text1">
        <SettingIcon width={20} height={20} /> <span class="text-base font-medium">应用设置</span>{' '}
      </div>
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
            optional
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
        <Expand title="千问系列">
          <EditInput
            label="apiKey"
            value={settingStore.models.AliQWen.apiKey}
            onSave={(v) => {
              const m = unwrap(settingStore.models)
              m.AliQWen.apiKey = v
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
              placeholder="唤起应用快捷键"
              onKeyDown={(e) => {
                e.preventDefault()
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
            label={
              navigator.userAgent.includes('Mac')
                ? '使用 Command+Enter 发送信息'
                : '使用 Ctrl+Enter 发送信息'
            }
            hint="关闭后使用 Enter 发起对话"
            checked={settingStore.sendWithCmdOrCtrl}
            onCheckedChange={setSendWithCmdOrCtrl}
          />
        </div>
      </Card>
      <Card title="更多信息">
        <div>
          <span>加入群聊，获取最新版本信息，和群友畅聊 AI ：</span>
          <div class="flex justify-center">
            <img src={groupCodeJpg} class="h-32 w-32 rounded-md border-none p-2" />
          </div>
        </div>
        <div class="text-sm text-text2">
          <span>本项目开源于</span>
          <a
            class="text-text-link hover:text-active"
            href="https://github.com/wizardAEI/Gomoon"
            target="_blank"
          >
            GitHub
          </a>
          <span> 。欢迎 Star 和提出您的宝贵建议。</span>
        </div>
        <div></div>
        <div class="mt-1 flex items-center gap-2 text-text2">
          <span>版本号：v1.0.4</span>
          <a
            class="text-text-link cursor-pointer hover:text-active"
            onClick={async () => {
              loading.show('正在检查更新')
              await updateVersion()
              loading.hide()
            }}
          >
            {updateStatusLabel()}
          </a>
        </div>
      </Card>
    </div>
  )
}
