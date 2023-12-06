import Loading from '@renderer/components/ui/Loading'
import { Show, createSignal } from 'solid-js'

export default function () {
  // FEAT: 延迟300ms显示
  const [show, setShow] = createSignal(false)
  setTimeout(() => setShow(true), 300)
  return (
    <Show when={show()}>
      <div class="flex h-full flex-col items-center justify-center gap-6 pb-20 text-white">
        <Loading />

        <span class="bg-cyber-pro bg-clip-text text-right text-transparent">
          “这是我在夜之城唯一能守护你的办法”
          <br />
          --- 赛博朋克边缘行者
        </span>
      </div>
    </Show>
  )
}
