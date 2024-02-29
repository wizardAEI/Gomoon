import Card from '@renderer/components/ui/Card'
import {
  settingStore,
  setIsOnTop,
  setModels,
  updateModelsToFile,
  setSendWithCmdOrCtrl,
  setCanMultiCopy,
  setQuicklyWakeUpKeys,
  updateVersion,
  updateStatusLabel
} from '../store/setting'
import Switch from '@renderer/components/ui/SwitchItem'
import Expand from '@renderer/components/ui/Expand'
import EditInput from '@renderer/components/ui/EditInput'
import { onCleanup, onMount } from 'solid-js'
import { unwrap } from 'solid-js/store'
import SettingIcon from '@renderer/assets/icon/base/SettingIcon'
import { useLoading } from '@renderer/components/ui/DynamicLoading'
import { useToast } from '@renderer/components/ui/Toast'
import QuestionMention from '@renderer/components/ui/QuestionMention'
export default function Setting() {
  onMount(() => {
    onCleanup(() => {
      updateModelsToFile()
    })
  })
  const loading = useLoading()
  const toast = useToast()
  return (
    <div class="flex h-full select-none flex-col gap-3 px-5 pt-2">
      <div class="flex select-none items-center gap-1 text-lg text-text1 lg:justify-center">
        <SettingIcon width={20} height={20} /> <span class="text-base font-medium">应用设置</span>{' '}
      </div>
      <div class="mx-auto flex w-full flex-col gap-3 overflow-auto pb-3 lg:max-w-4xl">
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
          <Expand
            title={
              <div class="flex items-center gap-1">
                文心系列
                <QuestionMention
                  content={
                    <a
                      class="text-xs"
                      href="https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application"
                    >
                      密钥注册地址
                    </a>
                  }
                />
              </div>
            }
          >
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
          <Expand
            title={
              <div class="flex items-center gap-1">
                千问系列
                <QuestionMention
                  content={
                    <a class="text-xs" href="https://dashscope.console.aliyun.com/apiKey">
                      密钥注册地址
                    </a>
                  }
                />
              </div>
            }
          >
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
          <div class="text-sm text-text2">
            <span>本项目开源于</span>
            <a href="https://github.com/wizardAEI/Gomoon" target="_blank">
              GitHub
            </a>
            <span>，您的 Star 和建议是对该项目最大的支持。</span>
          </div>
          <div class="mt-2 text-sm text-text2">
            <span>哈喽👋，我在</span>
            <a
              href="https://space.bilibili.com/434118077/channel/collectiondetail?sid=2235600"
              target="_blank"
            >
              哔哩哔哩
            </a>
            发布了教学视频，可以让你更加有效的使用 Gomoon，解锁更多功能！
          </div>
          <div class="mt-2 flex items-center gap-2 text-text2">
            <span>版本号：v1.0.6</span>
            <a
              class="cursor-pointer text-text-link hover:text-active"
              onClick={async () => {
                loading.show('正在检查更新')
                try {
                  if (!(await updateVersion())) {
                    toast.success('已是最新版本')
                  }
                } catch (e) {
                  // 浏览器打开 github
                  window.open('https://github.com/wizardAEI/Gomoon')
                  toast.error('检查更新失败')
                }
                loading.hide()
              }}
            >
              {updateStatusLabel()}
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
