import AnswerIcon from '@renderer/assets/icon/AnswerIcon'
import ChatIcon from '@renderer/assets/icon/ChatIcon'
import { useNavigate } from '@solidjs/router'
export default function TopBar() {
  const nav = useNavigate()
  return (
    <div class="bg-bac flex h-6 w-full text-center text-slate-50">
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
            nav('/answer')
          }}
        >
          <AnswerIcon
            width={16}
            height={16}
            class="text-icon-gray hover:text-icon-active duration-100"
          />
        </div>
        <div
          class="translate-y cursor-pointer"
          onclick={() => {
            nav('/')
          }}
        >
          <ChatIcon
            width={18}
            height={18}
            class="text-icon-gray hover:text-icon-active duration-100"
          />
        </div>
      </div>
    </div>
  )
}
