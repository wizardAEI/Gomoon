import { JSX, Show, createSignal } from 'solid-js'

export default function (props: {
  label: string
  children: JSX.Element
  position?: string
  onConfirm: () => void
}) {
  const [show, setShow] = createSignal(false)
  return (
    <div class="relative">
      <Show when={show()}>
        <div
          class={
            'shadow-center absolute flex animate-popup flex-col gap-2 overflow-visible rounded-sm bg-dark p-1 ' +
            props.position
          }
        >
          <div class="text-center text-xs">{props.label}</div>
          <div class="flex w-16 justify-around">
            <button
              class="rounded-sm px-1 py-[1px] text-[10px] duration-300 hover:bg-active"
              onClick={(e) => {
                e.stopImmediatePropagation()
                setShow(false)
              }}
            >
              取消
            </button>
            <button
              class="rounded-sm px-1 py-[1px] text-[10px] duration-300 hover:bg-active"
              onClick={(e) => {
                e.stopImmediatePropagation()
                setShow(false)
                props.onConfirm?.()
              }}
            >
              确定
            </button>
          </div>
        </div>
      </Show>
      <div
        onClick={(e) => {
          e.stopImmediatePropagation()
          setShow(true)
        }}
      >
        {props.children}
      </div>
    </div>
  )
}
