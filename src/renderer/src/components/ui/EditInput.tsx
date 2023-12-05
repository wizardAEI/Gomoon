import SaveIcon from '@renderer/assets/icon/base/SaveIcon'
import { Show, createSignal } from 'solid-js'

export default function EditInput(props: {
  label: string
  value?: string
  spellcheck?: boolean
  onSave: (value: string) => void
}) {
  const [value, setValue] = createSignal(props.value || '')
  const [isEditing, setIsEditing] = createSignal(false)
  let inputRef: HTMLInputElement | undefined
  const onSave = () => {
    props.onSave(value())
    setIsEditing(false)
  }

  return (
    <div class="flex flex-col">
      <label class="text-gray-500 mb-2 text-sm font-bold">{props.label}</label>
      <Show
        when={isEditing()}
        fallback={
          <div
            class="hover:bg-dark-con relative flex cursor-pointer items-center rounded p-1"
            onClick={() => {
              setIsEditing(true)
              inputRef?.focus()
            }}
          >
            <span class="text-gray-500 mr-2 truncate text-ellipsis text-sm">
              {value() || '填写您的 ' + props.label}
            </span>
          </div>
        }
      >
        <div class="relative">
          <input
            spellcheck={props.spellcheck || false}
            ref={inputRef}
            class="bg-gray-200 w-full max-w-[512px] rounded border-none bg-dark-pro px-2 py-1 text-sm focus:outline-none"
            type="text"
            value={value()}
            onInput={(e) => setValue((e.target as HTMLInputElement).value)}
            onBlur={onSave}
          />
          <SaveIcon
            height={20}
            class="absolute right-0 top-1 cursor-pointer text-dark-pro"
            onClick={onSave}
          />
        </div>
      </Show>
    </div>
  )
}
