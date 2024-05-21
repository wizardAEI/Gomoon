import Search2Icon from '@renderer/assets/icon/base/Search2Icon'
import { createSignal } from 'solid-js'

export function Search(props: { placeholder: string; onChange: (value: string) => void }) {
  const [composition, setComposition] = createSignal(false)
  return (
    <div class="relative">
      <div class="absolute left-2 top-[5px]">
        <Search2Icon height={20} width={20} class="text-text3" />
      </div>
      <input
        ref={(el) => {
          el.addEventListener('compositionstart', () => {
            setComposition(true)
          })
          el.addEventListener('compositionend', () => {
            setComposition(false)
          })
        }}
        class="h-8 rounded-lg pl-9"
        type="text"
        placeholder={props.placeholder}
        onInput={(e) => {
          setTimeout(() => {
            if (composition()) return
            props.onChange(e.target.value)
          })
        }}
      />
    </div>
  )
}
