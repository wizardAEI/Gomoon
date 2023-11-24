import { Route, Routes, useNavigate } from '@solidjs/router'
import TopBar from './components/TopBar'
import Chat from './pages/Chat'
import Answer from './pages/Answer'
import { onCleanup, onMount } from 'solid-js'
import { IpcRendererEvent } from 'electron'

const App = () => {
  const nav = useNavigate()

  onMount(() => {
    // FEAT: 快捷键触发操作
    const removeListener = window.api.multiCopy(async (_: IpcRendererEvent, msg: string) => {
      nav('/answer?q=' + msg)
    })
    onCleanup(() => removeListener())
  })

  return (
    <div class="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <div class="flex-1 overflow-auto bg-home">
        <Routes>
          <Route path="/" component={Chat} />
          <Route path="/answer" component={Answer} />
        </Routes>
      </div>
    </div>
  )
}

export default App
