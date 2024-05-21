import * as radio from '@zag-js/radio-group'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { Index, JSXElement, createMemo, createUniqueId } from 'solid-js'

const items = [
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'ng' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' }
]

export function SegmentedControl(props: {
  options: {
    label: string | JSXElement
    value: string
  }[]
  defaultValue: string
  onCheckedChange: (checked: string) => void
}) {
  const [state, send] = useMachine(
    radio.machine({
      id: createUniqueId(),
      value: props.defaultValue,
      onValueChange(details) {
        props.onCheckedChange(details.value)
      }
    })
  )

  const api = createMemo(() => radio.connect(state, send, normalizeProps))

  return (
    <div {...api().rootProps} class="flex gap-1 rounded-lg bg-dark p-1">
      <div
        {...api().indicatorProps}
        class="left-[var(--left)] h-[var(--height)] w-[var(--width)] rounded-md bg-active"
      />
      <Index each={props.options}>
        {(item) => (
          <label
            class={`${api().value === item().value ? 'text-text-active' : 'text-text1'} z-10 flex cursor-pointer items-center rounded-md px-2 duration-100`}
            {...api().getItemProps({ value: item().value })}
          >
            <span class="py-[2px]" {...api().getItemTextProps({ value: item().value })}>
              {item().label}
            </span>
            <input {...api().getItemHiddenInputProps({ value: item().value })} />
          </label>
        )}
      </Index>
    </div>
  )
}
