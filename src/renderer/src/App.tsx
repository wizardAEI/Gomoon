import { Route, Routes, useNavigate } from '@solidjs/router'
import TopBar from './components/TopBar'
import Chat from './pages/Chat'
import Answer from './pages/Answer'
import { onMount } from 'solid-js'

const App = () => {
  const nav = useNavigate()

  // FEAT: 快捷键触发操作
  onMount(() => {
    window.api.multiCopy(async () => {
      nav('/answer')
    })
  })

  return (
    <div class="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <div class="bg-home flex-1">
        <Routes>
          <Route path="/" component={Chat} />
          <Route path="/answer" component={Answer} />
        </Routes>
      </div>
    </div>
  )
}

export default App
