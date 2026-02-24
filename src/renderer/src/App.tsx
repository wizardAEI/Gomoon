import { useNavigate } from '@solidjs/router'
import { Show, createEffect, onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'
import mermaid from 'mermaid'

import TopBar from './components/TopBar'
import { loadConfig, setUpdaterStatus, settingStore, systemStore } from './store/setting'
import Loading from './pages/Loading'
import { loadUserData, setUserState, userData, userHasUse } from './store/user'
import { loadAssistants } from './store/assistants'
import { loadHistories } from './store/history'
import { ToastProvider } from './components/ui/Toast'
import { LoadingProvider } from './components/ui/DynamicLoading'
import { init as OCRInit } from './lib/ai/ocr'
import System from './pages/System'
import { loadMemories } from './store/memo'
import { loadCollection } from './store/collection'
import { event } from './lib/util'

const App = (props) => {
  const nav = useNavigate()

  onMount(async () => {
    // FEAT: 获取配置信息
    loadConfig()

    // FEAT: 获取用户信息
    loadUserData().then(() => {
      if (userData.firstTime) {
        userHasUse()
      }
      // FEAT: 初始化当前userState
      if (window.location.hash.startsWith('#/ans')) {
        setUserState('preSelectedAssistant', userData.selectedAssistantForAns)
      } else {
        setUserState('preSelectedAssistant', userData.selectedAssistantForChat)
      }
    })

    // FEAT: 助手信息
    loadAssistants()

    // FEAT: 历史信息
    loadHistories()

    // FEAT: 合集
    loadCollection()

    // FEAT: 记忆信息
    loadMemories()

    // FEAT: 快捷键触发操作
    const removeListener2 = window.api.showWindow((_, data) => {
      nav('/?text=' + data.text)
    })
    onCleanup(() => {
      removeListener2()
    })

    const removeListener = window.api.multiCopy(async (_: IpcRendererEvent, msg: string) => {
      nav('/ans?q=' + msg)
    })
    onCleanup(() => removeListener())

    // FEAT: Windows 从最小化恢复时强制重绘，缓解白屏/卡死
    if (navigator.userAgent.includes('Windows')) {
      const removeRestored = window.api.onWindowRestored(() => {
        requestAnimationFrame(() => {
          document.body.offsetHeight
          requestAnimationFrame(() => {})
        })
      })
      onCleanup(() => removeRestored())
    }

    // FEAT: OCR
    OCRInit()

    // FEAT: 主题
    createEffect(() => {
      // 插入 .win
      if (navigator.userAgent.includes('Windows')) {
        document.body.classList.add('win')
      }
      document.body.className.split(' ').map((cls) => {
        if (cls.endsWith('-theme')) {
          document.body.classList.remove(cls)
        }
      })
      document.body.classList.add(settingStore.theme)
    })
    createEffect(() => {
      const f = settingStore.fontFamily
      document.documentElement.style.setProperty(
        '--font-family',
        f === 'default' ? 'var(--font-family-default)' : f
      )
    })

    // FEAT: receive msg（权限提示每会话只弹一次）
    let accessDeniedShownThisSession = false
    window.api.receiveMsg(async (_, msg: string) => {
      if (msg === 'update-available' && !systemStore.updateStatus.canUpdate) {
        setUpdaterStatus({
          canUpdate: true
        })
      }
      if (msg === 'update-downloaded' && !systemStore.updateStatus.haveDownloaded) {
        setUpdaterStatus({
          haveDownloaded: true
        })
      }
      if (msg.includes('download-progress')) {
        const progress = parseInt(msg.split(' ')[1])
        setUpdaterStatus({
          updateProgress: progress
        })
      }
      if (msg.includes('event-tracker-translocated')) {
        alert(
          '快速问答（双击复制）需要将 Gomoon 安装在「应用程序」文件夹才能使用。\n\n当前检测到从临时位置运行（如从 DMG 直接打开），系统无法持久保存辅助功能权限，每次打开都会重新索要。\n\n请将 Gomoon 拖入「应用程序」文件夹后重新打开，再在系统设置中勾选 Gomoon 的辅助功能权限即可。'
        )
      }
      if (msg.includes('event-tracker-need-permission')) {
        alert(
          '快速问答（双击复制）需要「辅助功能」权限。\n\n已为您打开系统设置，请勾选 Gomoon 并重启应用。\n建议将 Gomoon 安装在「应用程序」文件夹内，否则权限可能无法持久保存。'
        )
      }
      if (msg.includes('event-tracker-access-denied') && !accessDeniedShownThisSession) {
        accessDeniedShownThisSession = true
        alert(
          '快速问答需要辅助功能权限。\n\n请将 Gomoon 拖入「应用程序」文件夹，在系统设置中勾选 Gomoon 后重启应用，权限才会持久生效。'
        )
      }
      if (msg.includes('event-tracker-spawn-error')) {
        alert('快速问答（双击复制）未能启动，请尝试重新安装 Gomoon。')
      }
    })

    // FEAT: 避免 ctrl + r 刷新页面 (生产环境)
    if (process.env.NODE_ENV === 'production') {
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
          e.preventDefault()
        }
      })
    }

    // FEAT: 覆写复制事件，防止复制携带格式
    document.addEventListener('copy', (event) => {
      if (!window.getSelection) return
      const selectedText = window!.getSelection()!.toString()
      event!.clipboardData!.setData('text/plain', selectedText)
      event.preventDefault() // 阻止默认复制行为
    })

    // FEAT: 增加全局搜索
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'f' || e.key === 'F') && (e.ctrlKey || e.metaKey)) {
        event.emit('globalSearch')
      }
    })

    // FEAT: 增加 Mermaid 支持
    mermaid.initialize({
      theme: 'default',
      themeVariables: {
        fontSize: '12px', // 设置全局字体大小
        nodeTextSize: '8px', // 设置节点字体大小
        edgeTextSize: '10px' // 设置边字体大小
      },
      flowchart: {
        useMaxWidth: false
      }
    })
  })

  return (
    // FEAT: UIProvider 中存储了全局的 UI 组件，如 Toast
    <ToastProvider>
      <LoadingProvider>
        <div class="flex h-screen flex-col overflow-hidden bg-home">
          <TopBar />
          <div class="flex-1 overflow-auto">
            <Show when={settingStore.isLoaded} fallback={<Loading />}>
              {props.children}
            </Show>
          </div>
        </div>
        <System />
      </LoadingProvider>
    </ToastProvider>
  )
}

export default App
