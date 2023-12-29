import { Route, Routes, useNavigate } from '@solidjs/router'
import TopBar from './components/TopBar'
import Chat from './pages/Chat'
import Answer from './pages/Answer'
import { Show, onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'
import Setting from './pages/Setting'
import { loadConfig, settingStore } from './store/setting'
import Loading from './pages/Loading'
import { loadUserData, userData, userHasUse } from './store/user'
import Assistants from './pages/Assistants'
import History from './pages/History'
import { loadAssistants } from './store/assistants'
import { loadHistories } from './store/history'
import { ToastProvider } from './components/ui/Toast'
import { LoadingProvider } from './components/ui/DynamicLoading'
import { init as OCRInit } from './lib/ai/ocr'
import { setUpdaterStatus } from './store/system'
import System from './pages/System'

const App = () => {
  const nav = useNavigate()
  onMount(async () => {
    // FEAT: 获取配置信息
    loadConfig()

    // FEAT: 获取用户信息
    loadUserData().then(() => {
      if (userData.firstTime) {
        alert('请允许程序权限后重启，以使用快捷方式功能')
        userHasUse()
      }
    })

    // FEAT: 助手信息
    loadAssistants()

    // FEAT: 历史信息
    loadHistories()

    // FEAT: 快捷键触发操作
    const removeListener = window.api.multiCopy(async (_: IpcRendererEvent, msg: string) => {
      nav('/answer?q=' + msg)
    })
    onCleanup(() => removeListener())

    // FEAT: OCR
    OCRInit()

    // FEAT: receive msg
    window.api.receiveMsg((_, msg: string) => {
      if (msg === 'update-downloaded')
        setUpdaterStatus({
          haveDownloaded: true
        })
      if (msg.includes('download-progress')) {
        const progress = parseInt(msg.split(' ')[1])
        setUpdaterStatus({
          updateProgress: progress
        })
      }
    })

    // 避免 ctrl + r 刷新页面 (生产环境)
    if (process.env.NODE_ENV === 'production') {
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
          e.preventDefault()
        }
      })
    }
  })

  return (
    // FEAT: UIProvider 中存储了全局的 UI 组件，如 Toast
    <ToastProvider>
      <LoadingProvider>
        <div class="flex h-screen flex-col overflow-hidden bg-home">
          <TopBar />
          <div class="flex-1 overflow-auto">
            <Show when={settingStore.isLoaded} fallback={<Loading />}>
              <Routes>
                <Route path="/" component={Chat} />
                <Route path="/answer" component={Answer} />
                <Route path="/setting" component={Setting} />
                <Route path="/assistants" component={Assistants} />
                <Route path="/history" component={History} />
                <Route path="*" component={Chat} />
              </Routes>
            </Show>
          </div>
        </div>
        <System />
      </LoadingProvider>
    </ToastProvider>
  )
}

export default App
