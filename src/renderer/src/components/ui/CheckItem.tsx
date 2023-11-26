import { Checkbox, CheckboxProps } from '@ark-ui/solid'
import QuestionMention from './QuestionMention'

export default function CheckItem(props: {
  label: string
  hint?: string
  checkProps: CheckboxProps
}) {
  return (
    <div>
      <Checkbox.Root {...props.checkProps} class="flex items-center justify-between">
        {(api) => (
          <>
            <Checkbox.Label asChild>
              <div class="flex items-center gap-1">
                {props.label}
                {props.hint && <QuestionMention content={props.hint} />}
              </div>
            </Checkbox.Label>
            <Checkbox.Control class="flex h-4 w-4 cursor-pointer overflow-hidden rounded-full bg-slate-200 text-xs duration-150 first:hidden data-[hover]:bg-slate-300 data-[state=checked]:bg-[#A57BEA]">
              {api().isChecked && (
                <div class=" pl-[2px] pt-[2px] text-black">
                  <svg
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="13301"
                    width="12"
                    height="12"
                    fill="#ffffff"
                  >
                    <path
                      d="M1002.88 321.92L405.76 935.04a32 32 0 0 1-45.76 0L21.12 612.48a32 32 0 0 1 0-44.8L160 433.6a32 32 0 0 1 45.76 0L359.04 576 796.16 120.64a32 32 0 0 1 46.08 0l160 156.48a32 32 0 0 1 0.64 44.8z"
                      p-id="13302"
                    ></path>
                  </svg>
                </div>
              )}
            </Checkbox.Control>
          </>
        )}
      </Checkbox.Root>
    </div>
  )
}
