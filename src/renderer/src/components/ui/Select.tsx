import { type Component, createMemo, createSignal, For, type JSXElement, Show } from 'solid-js'

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

// Select 组件
// FIXME: label是组件的时候有问题
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
    <div>
      <div class="cursor-pointer" onClick={() => setIsOpen(!isOpen())}>
        <div>{label()}</div>
      </div>
      <Show when={isOpen()}>
        <div>
          <For each={props.options}>
            {(option) => (
              <div class="cursor-pointer" onClick={() => handleSelect(option)}>
                <div>{option.label}</div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export default Select
