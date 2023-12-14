import AnswerIcon from '@renderer/assets/icon/AnswerIcon'
import ChatIcon from '@renderer/assets/icon/ChatIcon'
import HistoryIcon from '@renderer/assets/icon/base/HistoryIcon'
import SettingIcon from '@renderer/assets/icon/base/SettingIcon'
import CrossIcon from '@renderer/assets/icon/base/win/WinCrossIcon'
import { useLocation, useNavigate } from '@solidjs/router'
import { Show, createMemo } from 'solid-js'
export default function TopBar() {
  const nav = useNavigate()
  const location = useLocation()

  const pathname = createMemo(() => location.pathname)

  return (
    <div
      class={
        'flex w-full text-center text-slate-50 ' +
        (navigator.userAgent.includes('Win') ? 'h-7 pt-1' : 'h-6')
      }
    >
      <Show
        // win
        when={navigator.userAgent.includes('Win')}
      >
        <div class="flex items-center gap-2 px-4 pt-[5px]">
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
          <AnswerIcon
            width={16}
            height={16}
            onClick={() => {
              nav('/answer')
            }}
            class={
              'translate-y-[-1px] cursor-pointer duration-100 hover:text-active ' +
              (pathname() === '/answer' ? 'text-active' : 'text-gray')
            }
          />
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
        </div>
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
        <div class="flex h-6 items-center gap-2 px-4 pt-[5px]">
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
          <AnswerIcon
            width={16}
            height={16}
            onClick={() => {
              nav('/answer')
            }}
            class={
              'cursor-pointer duration-100 hover:text-active ' +
              (pathname() === '/answer' ? 'text-active' : 'text-gray')
            }
          />
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
        </div>
      </Show>
      {/* win 关闭按钮 */}
      <Show when={navigator.userAgent.includes('Win')}>
        <CrossIcon
          class="cursor-pointer pr-4 pt-[7px] text-gray duration-100 hover:text-active "
          height={13}
          width={13}
          onClick={() => {
            window.api.hideWindow()
          }}
        />
      </Show>
    </div>
  )
}
