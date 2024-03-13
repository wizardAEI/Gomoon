import { render } from 'solid-js/web'
import './assets/index.css'
import App from './App'
import { Route, Router } from '@solidjs/router'
import Chat from './pages/Chat'
import Answer from './pages/Answer'
import Setting from './pages/Setting'
import Assistants from './pages/Assistants'
import Memo from './pages/Memo'
import History from './pages/History'

render(
  () => (
    <Router root={App}>
      <Route path="/" component={Chat} />
      <Route path="/ans" component={Answer} />
      <Route path="/setting" component={Setting} />
      <Route path="/assistants" component={Assistants} />
      <Route path="/history" component={History} />
      <Route path="/memories" component={Memo} />
      <Route path="*404" component={Chat} />
    </Router>
  ),
  document.getElementById('root') as HTMLElement
)
