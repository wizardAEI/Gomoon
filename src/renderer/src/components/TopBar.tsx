import AnswerIcon from '@renderer/assets/icon/AnswerIcon'
import ChatIcon from '@renderer/assets/icon/ChatIcon'
import HistoryIcon from '@renderer/assets/icon/base/HistoryIcon'
import SettingIcon from '@renderer/assets/icon/base/SettingIcon'
import CrossIcon from '@renderer/assets/icon/base/win/WinCrossIcon'
import { useLocation, useNavigate } from '@solidjs/router'
import { Show, createMemo } from 'solid-js'
import ToolTip from './ui/ToolTip'
import MinimizeIcon from '@renderer/assets/icon/base/win/MinimizeIcon'

function Entries() {
  const nav = useNavigate()
  const location = useLocation()

  const pathname = createMemo(() => location.pathname)
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
              'cursor-pointer duration-100 hover:text-active ' +
              (pathname() === '/history' ? 'text-active' : 'text-gray')
            }
          />
        }
        content="历史记录"
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
              nav('/answer')
            }}
            class={
              'translate-y-[-1px] cursor-pointer duration-100 hover:text-active ' +
              (pathname() === '/answer' ? 'text-active' : 'text-gray')
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
              'cursor-pointer duration-100 hover:text-active ' +
              (pathname() === '/' || pathname() === '/chat' ? 'text-active' : 'text-gray')
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
                  'ml-[-0.0625rem] translate-y-[-0.5px] cursor-pointer duration-100 hover:text-active ' +
                  (pathname() === '/setting' ? 'text-active' : 'text-gray')
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
                'ml-[-0.0625rem] cursor-pointer duration-100 hover:text-active ' +
                (pathname() === '/setting' ? 'text-active' : 'text-gray')
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
  return (
    <div
      class={
        'relative z-50 flex w-full text-center text-slate-50 ' +
        (navigator.userAgent.includes('Mac') ? ' h-6' : 'h-7 pt-1')
      }
    >
      <Show
        // win
        when={navigator.userAgent.includes('Win')}
      >
        <div class="flex items-center gap-2 px-4 pt-[5px]">{<Entries />}</div>
      </Show>
      <div
        class="h-full flex-1"
        style={{
          '-webkit-app-region': 'drag'
        }}
      ></div>
      <Show
        // mac
        when={navigator.userAgent.includes('Mac')}
      >
        <div class="flex h-6 items-center gap-2 px-4 pt-[5px]">{<Entries />}</div>
      </Show>
      {/* win 关闭按钮 */}
      <Show when={navigator.userAgent.includes('Win')}>
        <MinimizeIcon
          class="cursor-pointer pr-4 pt-1 text-gray duration-100 hover:text-active "
          height={18}
          width={18}
          onClick={() => {
            window.api.minimizeWindow()
          }}
        />
        <CrossIcon
          class="cursor-pointer pr-4 pt-1 text-gray duration-100 hover:text-active "
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
