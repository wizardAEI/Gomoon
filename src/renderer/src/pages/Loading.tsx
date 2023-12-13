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
      </div>
    </Show>
  )
}
