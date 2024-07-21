import AnswerIcon from '@renderer/assets/icon/AnswerIcon'
import ChatIcon from '@renderer/assets/icon/ChatIcon'
import HistoryIcon from '@renderer/assets/icon/base/HistoryIcon'
import SettingIcon from '@renderer/assets/icon/base/SettingIcon'
import CrossIcon from '@renderer/assets/icon/base/win/WinCrossIcon'
import { useLocation, useNavigate } from '@solidjs/router'
import { Show, createMemo, createSignal, onMount } from 'solid-js'
import MinimizeIcon from '@renderer/assets/icon/base/win/MinimizeIcon'
import FullScreenIcon from '@renderer/assets/icon/base/win/FullScreenIcon'
import ExitFullScreenIcon from '@renderer/assets/icon/base/win/ExitFullScreenIcon'

import ToolTip from './ui/ToolTip'

function Entries() {
  const nav = useNavigate()
  const location = useLocation()
  const pathname = createMemo(() => {
    const name = location.pathname
    const query = location.query
    const dict = {
      '/history': 'history',
      '/ans': 'ans',
      '/chat': 'chat',
      '/': 'chat',
      '/setting': 'setting',
      '/assistants': query.type || 'assistants',
      '/memories': query.type || 'memories'
    }
    return dict[name] || 'chat'
  })

  return (
    <>
      <ToolTip
        label={
          <HistoryIcon
            width={18}
            height={18}
            onClick={() => {
              nav('/history')
            }}
            class={
              'cursor-pointer duration-100 hover:fill-active ' +
              (pathname() === 'history' ? 'fill-active' : 'fill-gray')
            }
          />
        }
        content="历史数据"
        position={{
          placement: 'bottom'
        }}
      />
      <ToolTip
        label={
          <AnswerIcon
            width={18}
            height={18}
            onClick={() => {
              nav('/ans')
            }}
            class={
              'translate-y-[-1px] cursor-pointer duration-100 hover:fill-active ' +
              (pathname() === 'ans' ? 'fill-active' : 'fill-gray')
            }
          />
        }
        content="问答对话"
        position={{
          placement: 'bottom'
        }}
      />

      <ToolTip
        label={
          <ChatIcon
            width={18}
            height={18}
            onClick={() => {
              nav('/chat')
            }}
            class={
              'cursor-pointer duration-100 hover:fill-active ' +
              (pathname() === 'chat' ? 'fill-active' : 'fill-gray')
            }
          />
        }
        content="连续对话"
        position={{
          placement: 'bottom'
        }}
      />

      <ToolTip
        label={
          <Show
            when={navigator.userAgent.includes('Mac')}
            fallback={
              <SettingIcon
                width={18.5}
                height={18.5}
                onClick={() => {
                  nav('/setting')
                }}
                class={
                  'ml-[-0.0625rem] translate-y-[-0.5px] cursor-pointer duration-100 hover:fill-active ' +
                  (pathname() === 'setting' ? 'fill-active' : 'fill-gray')
                }
              />
            }
          >
            <SettingIcon
              width={18}
              height={18}
              onClick={() => {
                nav('/setting')
              }}
              class={
                'ml-[-0.0625rem] cursor-pointer duration-100 hover:fill-active ' +
                (pathname() === 'setting' ? 'fill-active' : 'fill-gray')
              }
            />
          </Show>
        }
        content="设置"
        position={{
          placement: 'bottom'
        }}
      />
    </>
  )
}

export default function TopBar() {
  const isWin = createMemo(() => {
    return navigator.userAgent.includes('Win')
  })
  const isMac = createMemo(() => {
    return navigator.userAgent.includes('Mac')
  })
  const [isMaximized, setIsMaximized] = createSignal(false)
  onMount(() => {
    window.api.isMaximized().then(setIsMaximized)
  })
  return (
    <div class="relative z-50 flex h-8 w-full pt-1 text-slate-50 shadow-sm">
      <Show
        // win
        when={isWin()}
      >
        <div class="flex items-center gap-2 px-4">{<Entries />}</div>
      </Show>
      <div
        class="h-full flex-1"
        style={{
          '-webkit-app-region': 'drag'
        }}
      />
      <Show
        // mac
        when={isMac()}
      >
        <div class="flex h-6 items-center gap-2 px-4">{<Entries />}</div>
      </Show>
      {/* win 按钮*/}
      <Show when={isWin()}>
        <MinimizeIcon
          class="cursor-pointer pr-4 pt-1 text-gray duration-100 hover:fill-active "
          height={18}
          width={18}
          onClick={() => {
            window.api.minimizeWindow()
          }}
        />
        <Show
          when={isMaximized()}
          fallback={
            <FullScreenIcon
              class="cursor-pointer pr-4 pt-1 text-gray duration-100 hover:text-active "
              height={18}
              width={18}
              onClick={() => {
                window.api.maximizeWindow()
                window.api.isMaximized().then(setIsMaximized)
              }}
            />
          }
        >
          <ExitFullScreenIcon
            class="cursor-pointer pr-4 pt-1 text-gray duration-100 hover:text-active "
            height={18}
            width={18}
            onClick={() => {
              window.api.unmaximizeWindow()
              window.api.isMaximized().then(setIsMaximized)
            }}
          />
        </Show>
        <CrossIcon
          class="cursor-pointer pr-4 pt-1 text-gray duration-100 hover:fill-active "
          height={18}
          width={18}
          onClick={() => {
            window.api.hideWindow()
          }}
        />
      </Show>
    </div>
  )
}
