import { useLoading } from '@renderer/components/ui/DynamicLoading'
import { useToast } from '@renderer/components/ui/Toast'
import { updateStatusLabel, updateVersion } from '@renderer/store/setting'
import { For, Show, createSignal } from 'solid-js'

const versions = [
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
      '增加了Ollama引擎，可以搭配本地或远程的Ollama客户端使用',
      '现在gpt4和部分ollama模型支持图片理解啦！（https://ollama.com/library/llava）',
      '现已支持删除连续对话中的中间的一对内容'
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
      <div class="mt-2 text-text2">
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
        <br />
        <Show
          when={showMore()}
          fallback={
            <a
              class="cursor-pointer text-text-link hover:text-active"
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
                  <div>v{version.version}</div>
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
