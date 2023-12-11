import * as zagSwitch from '@zag-js/switch'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createUniqueId } from 'solid-js'
import QuestionMention from './QuestionMention'

export default function Switch(props: {
  label: string
  hint?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  const [state, send] = useMachine(
    zagSwitch.machine({
      id: createUniqueId(),
      checked: props.checked,
      onCheckedChange: (v) => props.onCheckedChange(v.checked as boolean)
    })
  )

  const api = createMemo(() => zagSwitch.connect(state, send, normalizeProps))

  return (
    <label {...api().rootProps} class="group flex items-center justify-between">
      <input {...api().hiddenInputProps} />
      <span {...api().labelProps} class={'flex items-center gap-1'}>
        {props.label}
        {props.hint && <QuestionMention content={props.hint} />}
      </span>
      <span {...api().controlProps}>
        <span {...api().thumbProps}>
          <div class="relative h-5 w-9">
            <div
              class={`bg-gray-300 absolute bottom-0 left-0 right-0 top-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out ${
                api().isChecked ? 'bg-[#A57BEA]' : 'group-hover:bg-gray-pro bg-gray'
              }`}
            >
              <span
                class={`absolute ml-[2px] mt-[2px] block h-4 w-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                  api().isChecked ? 'translate-x-4 transform' : ''
                }`}
              />
            </div>
          </div>
        </span>
      </span>
    </label>
  )
}
