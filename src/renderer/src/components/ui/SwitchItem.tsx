import { Switch as ASwitch } from '@ark-ui/solid'
import QuestionMention from './QuestionMention'

export default function SwitchItem(props: {
  label: string
  hint?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <ASwitch.Root
      checked={props.checked}
      onCheckedChange={(v) => props.onCheckedChange(v.checked as boolean)}
      class="flex items-center justify-between"
    >
      {(api) => (
        <>
          <ASwitch.Label class="flex items-center gap-1">
            {props.label}
            {props.hint && <QuestionMention content={props.hint} />}
          </ASwitch.Label>
          <ASwitch.Control asChild>
            <ASwitch.Thumb>
              <div class="relative h-5 w-9">
                <div
                  class={`bg-gray-300 absolute bottom-0 left-0 right-0 top-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out ${
                    api().isChecked ? 'bg-[#A57BEA]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    class={`absolute ml-[2px] mt-[2px] block h-4 w-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                      api().isChecked ? 'translate-x-4 transform' : ''
                    }`}
                  />
                </div>
              </div>
            </ASwitch.Thumb>
          </ASwitch.Control>
        </>
      )}
    </ASwitch.Root>
  )
}
