import AnswerIcon from '@renderer/assets/icon/AnswerIcon'
import ChatIcon from '@renderer/assets/icon/ChatIcon'
import HistoryIcon from '@renderer/assets/icon/base/HistoryIcon'
import SettingIcon from '@renderer/assets/icon/base/SettingIcon'
import { useLocation, useNavigate } from '@solidjs/router'
import { createMemo } from 'solid-js'
export default function TopBar() {
  const nav = useNavigate()
  const location = useLocation()

  const pathname = createMemo(() => location.pathname)

  return (
    <div class="flex h-6 w-full text-center text-slate-50">
      <div
        class="h-full flex-1"
        style={{
          '-webkit-app-region': 'drag'
        }}
      ></div>
      <div class="flex h-6 gap-2 px-4 pt-[5px]">
        <div
          class="cursor-pointer"
          onclick={() => {
            nav('/history')
          }}
        >
          <HistoryIcon
            width={18}
            height={18}
            class={
              'duration-100 hover:text-active ' +
              (pathname() === '/history' ? 'text-active' : 'text-gray')
            }
          />
        </div>
        <div
          class="cursor-pointer"
          onclick={() => {
            nav('/answer?init=true')
          }}
        >
          <AnswerIcon
            width={16}
            height={16}
            class={
              'duration-100 hover:text-active ' +
              (pathname() === '/answer' ? 'text-active' : 'text-gray')
            }
          />
        </div>
        <div
          class="translate-y cursor-pointer"
          onclick={() => {
            nav('/chat')
          }}
        >
          <ChatIcon
            width={18}
            height={18}
            class={
              'duration-100 hover:text-active ' +
              (pathname() === '/' || pathname() === '/chat' ? 'text-active' : 'text-gray')
            }
          />
        </div>
        <div
          class="cursor-pointer"
          onclick={() => {
            nav('/setting')
          }}
        >
          <SettingIcon
            width={18}
            height={18}
            class={
              'ml-[-0.0625rem] duration-100 hover:text-active ' +
              (pathname() === '/setting' ? 'text-active' : 'text-gray')
            }
          />
        </div>
      </div>
    </div>
  )
}
