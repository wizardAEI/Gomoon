import { type JSXElement } from 'solid-js'
import { PositioningOptions } from '@zag-js/popper'
import * as tooltip from '@zag-js/tooltip'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createUniqueId, Show } from 'solid-js'

export default function (props: {
  size?: number
  color?: string
  label: string | JSXElement
  content: string | JSXElement
  fill?: string
  position?: PositioningOptions
}) {
  const [state, send] = useMachine(
    tooltip.machine({
      id: createUniqueId(),
      interactive: true,
      openDelay: 200,
      closeDelay: 300,
      // eslint-disable-next-line solid/reactivity
      positioning: props.position || {
        placement: 'top'
      }
    })
  )

  const api = createMemo(() => tooltip.connect(state, send, normalizeProps))
  return (
    <div class="inline-block">
      <button
        {...api().triggerProps}
        class="relative z-[10] flex cursor-pointer items-center overflow-visible border-0 bg-transparent px-0 py-0"
      >
        {props.label}
      </button>
      <Show when={api().open && props.content}>
        <div {...api().positionerProps}>
          <div
            {...api().contentProps}
            class="z-[9] rounded-md bg-white/80 p-1 text-xs text-text-dark"
          >
            {props.content}
          </div>
        </div>
      </Show>
    </div>
  )
}
