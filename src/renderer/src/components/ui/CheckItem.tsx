import QuestionMention from './QuestionMention'
import * as checkbox from '@zag-js/checkbox'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemo, createUniqueId } from 'solid-js'

export function CheckItem(props: {
  label: string
  hint?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  const [state, send] = useMachine(
    checkbox.machine({
      id: createUniqueId(),
      checked: props.checked,
      onCheckedChange: (v) => props.onCheckedChange(v.checked as boolean)
    })
  )
  const api = createMemo(() => checkbox.connect(state, send, normalizeProps))

  return (
    <label {...api().rootProps} class="flex items-center justify-between">
      <span {...api().labelProps} class="flex items-center gap-1">
        {props.label}
        {props.hint && <QuestionMention content={props.hint} />}
      </span>
      <div
        {...api().controlProps}
        class="flex h-[18px] w-[18px] cursor-pointer items-center overflow-hidden rounded-full bg-slate-200 text-xs duration-150 first:hidden data-[hover]:bg-slate-300 data-[state=checked]:bg-[#A57BEA]"
      >
        {api().isChecked && (
          <div class=" text-text-dark pl-[2px] pt-[3.5px]">
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="13301"
              width="14"
              height="14"
              fill="#ffffff"
            >
              <path
                d="M1002.88 321.92L405.76 935.04a32 32 0 0 1-45.76 0L21.12 612.48a32 32 0 0 1 0-44.8L160 433.6a32 32 0 0 1 45.76 0L359.04 576 796.16 120.64a32 32 0 0 1 46.08 0l160 156.48a32 32 0 0 1 0.64 44.8z"
                p-id="13302"
              ></path>
            </svg>
          </div>
        )}
      </div>
      <input {...api().hiddenInputProps} />
    </label>
  )
}
