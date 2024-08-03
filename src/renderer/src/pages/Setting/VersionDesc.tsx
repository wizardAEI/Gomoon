import { useLoading } from '@renderer/components/ui/DynamicLoading'
import { useToast } from '@renderer/components/ui/Toast'
import { updateStatusLabel, updateVersion } from '@renderer/store/setting'
import { For, Show, createSignal } from 'solid-js'

const versions = [
  {
    version: '1.1.9',
    contents: ['一些细节的优化', '字体主题功能上线~']
  },
  {
    version: '1.1.8',
    contents: ['一些细节的优化']
  },
  {
    version: '1.1.7',
    contents: ['一些细节的优化', '新增了合集功能，快来创建你的生词本、xx笔记吧~']
  },
  {
    version: '1.1.6',
    contents: [
      '一些细节的优化',
      '划选了一段文字后，使用快捷键召唤 Gomoon 会有新效果哦',
      'Gemini 支持了图片理解，默认模型改为 gemini-1.5-pro'
    ]
  },
  {
    version: '1.1.5',
    contents: [
      '一些细节的优化',
      '聊天文字的大小支持切换',
      '新增了自定义模型 😶',
      'Gemini 现在也支持自定义模型啦',
      '联网查询第n次升级，希望这次会好用些 🥹'
    ]
  },
  {
    version: '1.1.4',
    contents: ['一些细节的优化', 'Windows平台现在也支持全屏啦']
  },
  {
    version: '1.1.3',
    contents: [
      '助手偏好模型（点击更多助手进行编辑即可体验~）',
      '增加了KIMI的图片识别功能。',
      '一些细节的优化'
    ]
  },
  {
    version: '1.1.2',
    contents: ['修复一些消息历史模块的已知问题。', '消息历史页面样式优化。']
  },
  {
    version: '1.1.1',
    contents: [
      '历史消息功能升级，支持了更多实用功能！',
      '启动新对话时会自动保留上一次对话，管理历史消息更省心~',
      '白月光主题适配优化。',
      '最新模型『千问Long』上线，同时『文心 128K』更新为『Speed 128K』系列。'
    ]
  },
  {
    version: '1.1.0',
    contents: [
      '白月光主题上线！不是单纯的白，色彩柔和更护眼，适合亮度较高的环境下使用。',
      '下载对话记录支持了图片格式，快分享给你的朋友吧！',
      'gpt4目前默认为了 gpt-4o, 价格更低，速度更快。'
    ]
  },
  {
    version: '1.0.9',
    contents: [
      '增加了Ollama引擎，可以搭配本地或远程的Ollama客户端使用。',
      '现在gpt4和部分ollama模型支持图片理解啦！（https://ollama.com/library/llava）',
      '现已支持删除连续对话中的中间的一对内容。'
    ]
  }
]

export default function () {
  const loading = useLoading()
  const toast = useToast()
  const [showMore, setShowMore] = createSignal(false)
  return (
    <>
      <div class="mt-2 flex items-center gap-2 text-text2">
        <span>v{versions[0].version}</span>
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
      <div class="mt-1 text-text2">
        {
          <For each={versions[0].contents}>
            {(content, index) => {
              return (
                <>
                  &nbsp;{index() + 1}. {content} <br />
                </>
              )
            }}
          </For>
        }
        <Show
          when={showMore()}
          fallback={
            <a
              class="mt-3 cursor-pointer text-text-link hover:text-active"
              onClick={async () => setShowMore(true)}
            >
              查看更多
            </a>
          }
        >
          <For each={versions.slice(1)}>
            {(version, index) => {
              return (
                <>
                  <div class="mt-3">v{version.version}</div>
                  <For each={versions[index() + 1].contents}>
                    {(content, index) => {
                      return (
                        <>
                          &nbsp;{index() + 1}. {content} <br />
                        </>
                      )
                    }}
                  </For>
                </>
              )
            }}
          </For>
        </Show>
      </div>
    </>
  )
}
