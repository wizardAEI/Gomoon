import { JSXElement } from 'solid-js'
import { PositioningOptions } from '@zag-js/popper'
import * as tooltip from '@zag-js/tooltip'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createUniqueId, Show } from 'solid-js'

export default function Tooltip(props: {
  size?: number
  color?: string
  label: string | JSXElement
  content: string
  fill?: string
  position?: PositioningOptions
}) {
  const [state, send] = useMachine(
    tooltip.machine({
      id: createUniqueId(),
      openDelay: 200,
      closeDelay: 300,
      positioning: props.position || {
        placement: 'right'
      }
    })
  )

  const api = createMemo(() => tooltip.connect(state, send, normalizeProps))

  return (
    <div class="inline-block">
      <button
        {...api().triggerProps}
        class="flex cursor-pointer items-center border-0 bg-transparent"
      >
        {props.label}
      </button>
      <Show when={api().isOpen}>
        <div {...api().positionerProps}>
          <div {...api().contentProps} class="rounded-md bg-white p-1 text-xs">
            {props.content}
          </div>
        </div>
      </Show>
    </div>
  )
}
