import { Route, Routes, useNavigate } from '@solidjs/router'
import TopBar from './components/TopBar'
import Chat from './pages/Chat'
import Answer from './pages/Answer'
import { onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'
import Setting from './pages/Setting'

const App = () => {
  const nav = useNavigate()

  onMount(() => {
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
        <Routes>
          <Route path="/" component={Chat} />
          <Route path="/answer" component={Answer} />
          <Route path="/setting" component={Setting} />
          <Route path="*" component={Chat} />
        </Routes>
      </div>
    </div>
  )
}

export default App
