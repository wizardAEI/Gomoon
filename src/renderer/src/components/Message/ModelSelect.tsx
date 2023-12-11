import ChatGptIcon from '@renderer/assets/icon/models/ChatGptIcon'
import WenxinIcon from '@renderer/assets/icon/models/WenxinIcon'
import { setSelectedModel, userData } from '@renderer/store/user'
import { createMemo, createSignal, For, JSXElement, Show } from 'solid-js'
import { ModelsType } from 'src/main/model/model'

export default function (props: { position: string; size?: number }) {
  const options: {
    label: JSXElement
    icon: (size: number) => JSXElement
    value: ModelsType
  }[] = [
    {
      label: <span class="text-base text-current">文心3</span>,
      icon(size: number) {
        return (
          <WenxinIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'ERNIE3'
    },
    {
      label: <span class="text-base text-current">文心4</span>,
      icon(size: number) {
        return (
          <WenxinIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'ERNIE4'
    },
    {
      label: <span class="text-base text-current">GPT3</span>,
      icon(size: number) {
        return (
          <ChatGptIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GPT3'
    },
    {
      label: <span class="text-base text-current">GPT4</span>,
      icon(size: number) {
        return (
          <ChatGptIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GPT4'
    }
  ]
  // 使用 createSignal 来管理下拉菜单的显示状态
  const [isOpen, setIsOpen] = createSignal(false)
  // 使用 createSignal 来管理选中的值
  // 选择选项的处理函数
  const handleSelect = (option) => {
    setSelectedModel(option.value)
    setIsOpen(false)
  }
  const label = createMemo(() => {
    return (
      <span>
        {options.find((opt) => opt.value === userData.selectedModel)?.icon(props.size || 20) ?? (
          <ChatGptIcon />
        )}
      </span>
    )
  })
  return (
    <div>
      <div
        class="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          return setIsOpen(!isOpen())
        }}
      >
        {label()}
      </div>
      <Show when={isOpen()}>
        <div
          class={
            'absolute z-10 mt-3 grid w-44 grid-cols-2 grid-rows-2 gap-1 rounded-md bg-dark p-2 ' +
            props.position
          }
        >
          <For each={options}>
            {(option) => (
              <div
                class={`cursor-pointer break-words rounded-lg py-1 pl-1 pr-0 ${
                  userData.selectedModel === option.value ? 'bg-active-gradient' : ''
                } hover:bg-gray
                `}
                onClick={() => handleSelect(option)}
              >
                <div class={`flex select-none items-center gap-1 text-text1`}>
                  {option.icon(20)}
                  {option.label}
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
