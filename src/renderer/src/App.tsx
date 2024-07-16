import { useNavigate } from '@solidjs/router'
import { Show, createEffect, onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'

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
      console.log(window.location.pathname)
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

    // FEAT: 记忆信息
    loadMemories()

    // FEAT: 快捷键触发操作
    const removeListener2 = window.api.showWindow((_, data) => {
      nav('/?text=' + data.text)
    })
    onCleanup(() => removeListener2())

    const removeListener = window.api.multiCopy(async (_: IpcRendererEvent, msg: string) => {
      nav('/ans?q=' + msg)
    })
    onCleanup(() => removeListener())

    // FEAT: OCR
    OCRInit()

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

    // FEAT: receive msg
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
      if (msg.includes('event-tracker-access-denied')) {
        alert('请允许程序权限后重启，以使用快捷方式功能')
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
