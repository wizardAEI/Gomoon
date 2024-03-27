import QuestionMarkIcon from '@renderer/assets/icon/base/QuestionMarkIcon'
import * as tooltip from '@zag-js/tooltip'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createUniqueId, type JSX, Show } from 'solid-js'

export default function QuestionMention(props: {
  size?: number
  color?: string
  content: string | JSX.Element
  fill?: string
}) {
  const [state, send] = useMachine(
    tooltip.machine({
      id: createUniqueId(),
      openDelay: 200,
      closeDelay: 300,
      positioning: {
        placement: 'top'
      }
    })
  )

  const api = createMemo(() => tooltip.connect(state, send, normalizeProps))

  return (
    <div class="inline-block">
      <button
        {...api().triggerProps}
        class="flex h-full cursor-pointer items-center rounded-full border-0 bg-transparent px-0 py-0"
      >
        <QuestionMarkIcon
          fill={props.fill || '#869d9d'}
          class="scale-[118%] font-light"
          width={props.size || 14}
          height={props.size || 14}
        />
      </button>
      <Show when={api().isOpen}>
        <div {...api().positionerProps}>
          <div
            {...api().contentProps}
            style={{
              color: props.color || '#333333'
            }}
            class="rounded-md bg-white/90 p-1 text-xs"
          >
            {props.content}
          </div>
        </div>
      </Show>
    </div>
  )
}
