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

const App = () => {
  const nav = useNavigate()
  onMount(() => {
    // FEAT: 事件监听状态
    window.api.getEventHandlerStatus().then((r) => {
      console.info('事件监听状态', r)
    })

    // FEAT: 获取配置信息
    loadConfig()

    // FEAT: 获取用户信息
    loadUserData().then(() => {
      if (userData.firstTime) {
        alert('请允许程序权限后重启，以使用快捷方式功能')
        userHasUse()
      }
    })

    // FEAT: 快捷键触发操作
    const removeListener = window.api.multiCopy(async (_: IpcRendererEvent, msg: string) => {
      nav('/answer?q=' + msg)
    })
    onCleanup(() => removeListener())

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
    <div class="flex h-screen flex-col overflow-hidden bg-home">
      <TopBar />
      <div class="flex-1 overflow-auto">
        <Show when={settingStore.isLoaded} fallback={<Loading />}>
          <Routes>
            <Route path="/" component={Chat} />
            <Route path="/answer" component={Answer} />
            <Route path="/setting" component={Setting} />
            <Route path="*" component={Chat} />
          </Routes>
        </Show>
      </div>
    </div>
  )
}

export default App
