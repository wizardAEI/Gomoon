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
    <div class="flex h-6 w-full text-center text-slate-50">
      <Show
     // win
     when={navigator.userAgent.includes('Win')}
     >
     <div class="flex h-6 gap-2 px-4 pt-[5px] items-center">
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
          onClick={
            () => {
              nav('/chat')
            }
          }
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
              'cursor-pointer ml-[-0.0625rem] duration-100 hover:text-active ' +
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
     <div class="flex h-6 gap-2 px-4 pt-[5px] items-center">
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
          onClick={
            () => {
              nav('/chat')
            }
          }
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
              'cursor-pointer ml-[-0.0625rem] duration-100 hover:text-active ' +
              (pathname() === '/setting' ? 'text-active' : 'text-gray')
            }
          />
      </div>
     </Show>
     {/* win 关闭按钮 */}
     <Show
     when={navigator.userAgent.includes('Win')}
     >
      <CrossIcon
      class= 'pt-[7px] pr-4 cursor-pointer text-gray duration-100 hover:text-active '
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
