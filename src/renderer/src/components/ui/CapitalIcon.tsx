import * as tooltip from '@zag-js/tooltip'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createUniqueId, Show } from 'solid-js'

export default function CapitalIcon(props: {
  size?: number
  content: string
  bg?: 'gray' | 'purple'
  hiddenTiptop?: boolean
}) {
  const [state, send] = useMachine(
    tooltip.machine({ id: createUniqueId(), openDelay: 200, closeDelay: 300 })
  )

  const api = createMemo(() => tooltip.connect(state, send, normalizeProps))
  const firstChat = props.content.charAt(0)

  return (
    <div>
      <button
        {...api().triggerProps}
        class={`flex items-center justify-center rounded-md border-0 text-[12px] font-bold leading-3 ${
          props.bg === 'gray' ? 'bg-gray' : 'bg-purple'
        }`}
        style={{
          width: props.size ? `${props.size}px` : '16px',
          height: props.size ? `${props.size}px` : '16px'
        }}
      >
        <div
          style={{
            'font-size': props.size
              ? `${props.size < 25 ? props.size * 0.65 : props.size * 0.6}px`
              : '10px'
          }}
          class="cursor-pointer text-slate-200 duration-200 hover:text-slate-100"
        >
          {firstChat}
        </div>
      </button>
      <Show when={api().isOpen && !props.hiddenTiptop}>
        <div {...api().positionerProps}>
          <div {...api().contentProps} class="rounded-md bg-white/70 p-1 text-xs">
            {props.content}
          </div>
        </div>
      </Show>
    </div>
  )
}
