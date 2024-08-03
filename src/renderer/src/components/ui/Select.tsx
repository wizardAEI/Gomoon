import {
  type Component,
  createMemo,
  createSignal,
  For,
  type JSXElement,
  Show,
  onCleanup
} from 'solid-js'

// 选项类型，可以是字符串或 JSXElement 元素
type OptionType = {
  value: string
  label: JSXElement | string
}

// Select 组件的 Props
type SelectProps = {
  defaultValue: string
  options: OptionType[]
  onSelect: (value: string) => void
}

/**
 * @returns
 * @description defaultValue 默认值, options: {
    value: string
    label: JSXElement | string
  }
  onSelect: (value: string) => void
 */
const Select: Component<SelectProps> = (props) => {
  // 使用 createSignal 来管理下拉菜单的显示状态
  const [isOpen, setIsOpen] = createSignal(false)
  // eslint-disable-next-line solid/reactivity
  const options = props.options.map((option) => ({
    value: option.value,
    get label() {
      return option.label
    }
  }))
  // 使用 createSignal 来管理选中的值
  const [selectedValue, setSelectedValue] = createSignal<string>(props.defaultValue)
  const label = createMemo(() => {
    const cmp = options.find((opt) => opt.value === selectedValue())?.label
    return (
      <div>
        <div>{cmp ?? 'default value'}</div>
      </div>
    )
  })
  // 选择选项的处理函数
  const handleSelect = (option: OptionType) => {
    setSelectedValue(option.value)
    setIsOpen(false)
    props.onSelect(option.value)
  }

  return (
    <div class={`relative w-full ${isOpen() ? 'z-20' : 'z-10'}`}>
      <div
        class="mb-1 cursor-pointer rounded-lg border-solid border-dark px-4 py-[2px] text-center hover:border-active"
        ref={(el) => {
          const fn = (e) => {
            if (e.target && el.contains(e.target)) {
              setIsOpen((i) => !i)
              e.stopPropagation()
              return
            }
            setIsOpen(false)
          }
          document.addEventListener('click', fn)
          onCleanup(() => {
            document.removeEventListener('click', fn)
          })
        }}
      >
        {label()}
      </div>
      <Show when={isOpen()}>
        <div class="z-20 w-full rounded-lg bg-dark-plus p-1 shadow-center">
          <div class="scrollbar-show max-h-40">
            <For each={props.options}>
              {(option) => (
                <div class="my-2 cursor-pointer text-center" onClick={() => handleSelect(option)}>
                  <div class="hover:text-active">{option.label}</div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default Select
