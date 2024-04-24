import Card from '@renderer/components/ui/Card'
import Switch from '@renderer/components/ui/SwitchItem'
import Collapse from '@renderer/components/ui/Collapse'
import EditInput from '@renderer/components/ui/EditInput'
import { onCleanup, onMount } from 'solid-js'
import { unwrap } from 'solid-js/store'
import SettingIcon from '@renderer/assets/icon/base/SettingIcon'
import { useLoading } from '@renderer/components/ui/DynamicLoading'
import { useToast } from '@renderer/components/ui/Toast'
import QuestionMention from '@renderer/components/ui/QuestionMention'
import Expand from '@renderer/components/ui/Expand'
import MoreIcon from '@renderer/assets/icon/base/MoreIcon'
import UpwardArrow from '@renderer/assets/icon/base/arrow/UpwardArrow'
import Slider from '@renderer/components/ui/Slider'
import ChatGptICon from '@renderer/assets/icon/models/ChatGptIcon'
import WenxinIcon from '@renderer/assets/icon/models/WenxinIcon'
import QWenIcon from '@renderer/assets/icon/models/QWenIcon'
import GeminiIcon from '@renderer/assets/icon/models/GeminiIcon'
import LlamaIcon from '@renderer/assets/icon/models/LlamaIcon'
import KimiIcon from '@renderer/assets/icon/models/KimiIcon'
import FilePicker from '@renderer/components/ui/FilePicker'
import OllamaIcon from '@renderer/assets/icon/models/OllamaIcon'

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
          <div class="px-2">
            <Collapse
              title={
                <div class="flex items-center gap-2">
                  <ChatGptICon class="rounded-md" height={20} width={20} />
                  ChatGPT系列
                  <QuestionMention content="baseURL 通常需要在域名后添加 /v1 后缀" />
                </div>
              }
            >
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
              <EditInput
                optional
                label="自定义模型"
                value={settingStore.models.OpenAI.customModel}
                onSave={(v) => {
                  const m = unwrap(settingStore.models)
                  m.OpenAI.customModel = v
                  setModels(m)
                }}
              />
              <div class="mb-1 flex h-7 items-center gap-4">
                <span class="font-bold">创造性/随机性</span>
                <div class="w-60">
                  <Slider
                    defaultValue={settingStore.models.OpenAI.temperature}
                    percentage
                    onChange={(v) => {
                      const m = unwrap(settingStore.models)
                      m.OpenAI.temperature = v
                      setModels(m)
                    }}
                  />
                </div>
              </div>
            </Collapse>
            <Collapse
              title={
                <div class="flex items-center gap-2">
                  <WenxinIcon class="rounded-md" height={20} width={20} />
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
              <div class="mb-1 flex h-7 items-center gap-4">
                <span class="font-bold">创造性/随机性</span>
                <div class="w-60">
                  <Slider
                    percentage
                    defaultValue={settingStore.models.BaiduWenxin.temperature}
                    onChange={(v) => {
                      const m = unwrap(settingStore.models)
                      m.BaiduWenxin.temperature = v
                      setModels(m)
                    }}
                  />
                </div>
              </div>
            </Collapse>
            <Expand
              title={
                <div class="flex items-center justify-center gap-2">
                  <MoreIcon height={16} width={16} />
                  <span>更多模型引擎</span>
                </div>
              }
              foldTitle={
                <div class="flex items-center justify-center gap-2">
                  <UpwardArrow height={16} width={16} />
                  <span>收起模型引擎</span>
                </div>
              }
            >
              <Collapse
                title={
                  <div class="flex items-center gap-2">
                    <QWenIcon class="rounded-md" height={18} width={18} /> 千问系列
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
                <div class="mb-1 flex h-7 items-center gap-4">
                  <span class="font-bold">创造性/随机性</span>
                  <div class="w-60">
                    <Slider
                      defaultValue={settingStore.models.AliQWen.temperature}
                      percentage
                      onChange={(v) => {
                        const m = unwrap(settingStore.models)
                        m.AliQWen.temperature = v
                        setModels(m)
                      }}
                    />
                  </div>
                </div>
              </Collapse>
              <Collapse
                title={
                  <div class="flex items-center gap-2">
                    <GeminiIcon width={20} height={20} class="rounded-md" /> Gemini ( Google ) 系列
                  </div>
                }
              >
                <EditInput
                  label="apiKey"
                  value={settingStore.models.Gemini.apiKey}
                  onSave={(v) => {
                    const m = unwrap(settingStore.models)
                    m.Gemini.apiKey = v
                    setModels(m)
                  }}
                />
                <div class="mb-1 flex h-7 items-center gap-4">
                  <span class="font-bold">创造性/随机性</span>
                  <div class="w-60">
                    <Slider
                      defaultValue={settingStore.models.Gemini.temperature}
                      percentage
                      onChange={(v) => {
                        const m = unwrap(settingStore.models)
                        m.Gemini.temperature = v
                        setModels(m)
                      }}
                    />
                  </div>
                </div>
              </Collapse>
              <Collapse
                title={
                  <div class="flex items-center gap-2">
                    <LlamaIcon class="rounded-md" width={20} height={20} /> Llama ( Meta ) 本地模型
                    <QuestionMention
                      content={
                        <a
                          class="text-xs"
                          href="https://huggingface.co/meta-llama/Llama-2-70b-chat-hf"
                        >
                          模型获取地址
                        </a>
                      }
                    />
                  </div>
                }
              >
                <div class="flex max-w-full gap-3">
                  <span class="font-medium">本地模型地址</span>
                  <div class="flex-1 overflow-hidden">
                    <FilePicker
                      onChange={(path) => {
                        const m = unwrap(settingStore.models)
                        m.Llama.src = path
                        setModels(m)
                      }}
                      path={settingStore.models.Llama.src || '选择文件地址'}
                    />
                  </div>
                </div>
                <div class="mb-1 flex h-7 items-center gap-4">
                  <span class="font-bold">创造性/随机性</span>
                  <div class="w-60">
                    <Slider
                      defaultValue={settingStore.models.Llama.temperature}
                      percentage
                      onChange={(v) => {
                        const m = unwrap(settingStore.models)
                        m.Llama.temperature = v
                        setModels(m)
                      }}
                    />
                  </div>
                </div>
              </Collapse>
              <Collapse
                title={
                  <div class="flex items-center gap-2">
                    <OllamaIcon class="rounded-md" width={20} height={20} /> Ollama 系列
                    <QuestionMention
                      content={
                        <a class="text-xs" href="https://ollama.com">
                          模型获取地址
                        </a>
                      }
                    />
                  </div>
                }
              >
                <EditInput
                  label="模型地址 (ip:端口)"
                  value={settingStore.models.Ollama.address}
                  onSave={(v) => {
                    const m = unwrap(settingStore.models)
                    m.Ollama.address = v
                    setModels(m)
                  }}
                />
                <EditInput
                  label="模型名称"
                  value={settingStore.models.Ollama.model}
                  onSave={(v) => {
                    const m = unwrap(settingStore.models)
                    m.Ollama.model = v
                    setModels(m)
                  }}
                />
                <div class="mb-1 flex h-7 items-center gap-4">
                  <span class="font-bold">创造性/随机性</span>
                  <div class="w-60">
                    <Slider
                      defaultValue={settingStore.models.Ollama.temperature}
                      percentage
                      onChange={(v) => {
                        const m = unwrap(settingStore.models)
                        m.Ollama.temperature = v
                        setModels(m)
                      }}
                    />
                  </div>
                </div>
              </Collapse>
              <Collapse
                title={
                  <div class="flex items-center gap-2">
                    <KimiIcon class="rounded-md" height={20} width={20} /> Kimi ( Moonshot AI ) 系列
                    <QuestionMention
                      content={
                        <a class="text-xs" href="https://platform.moonshot.cn/console/api-keys">
                          密钥注册地址
                        </a>
                      }
                    />
                  </div>
                }
              >
                <EditInput
                  label="apiKey"
                  value={settingStore.models.Moonshot.apiKey}
                  onSave={(v) => {
                    const m = unwrap(settingStore.models)
                    m.Moonshot.apiKey = v
                    setModels(m)
                  }}
                />
                <EditInput
                  optional
                  label="baseURL"
                  value={settingStore.models.Moonshot.baseURL}
                  onSave={(v) => {
                    const m = unwrap(settingStore.models)
                    m.Moonshot.baseURL = v
                    setModels(m)
                  }}
                />
                <div class="mb-1 flex h-7 items-center gap-4">
                  <span class="font-bold">创造性/随机性</span>
                  <div class="w-60">
                    <Slider
                      defaultValue={settingStore.models.Moonshot.temperature}
                      percentage
                      onChange={(v) => {
                        const m = unwrap(settingStore.models)
                        m.Moonshot.temperature = v
                        setModels(m)
                      }}
                    />
                  </div>
                </div>
              </Collapse>
            </Expand>
          </div>
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
            <span>版本号：v1.0.9</span>
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
          <div class="mt-2 text-text2">
            版本更新内容： <br />
            &nbsp;1. 增加了ollama模型 <br />
            &nbsp;2. 现在gpt4和部分ollama模型支持图片理解啦！（https://ollama.com/library/llava）
            <br />
            &nbsp;3. 现已支持删除连续对话中的中间的一对内容 <br />
          </div>
        </Card>
      </div>
    </div>
  )
}
