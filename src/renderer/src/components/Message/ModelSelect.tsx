import ChatGptIcon from '@renderer/assets/icon/models/ChatGptIcon'
import WenxinIcon from '@renderer/assets/icon/models/WenxinIcon'
import { setSelectedModel, userData } from '@renderer/store/user'
import { createMemo, createSignal, For, JSXElement, Show } from 'solid-js'
import { ModelsType } from 'src/main/model/model'

export default function (props: { position: 'left-1' | 'right-1' | 'right-0' }) {
  const options: {
    label: JSXElement
    icon: JSXElement
    value: ModelsType
  }[] = [
    {
      label: (
        <div class="flex items-center gap-1">
          <WenxinIcon width={20} height={20} class="cursor-pointer overflow-hidden rounded-md" />
          <span class="text-base text-text1">文心3</span>
        </div>
      ),
      icon: <WenxinIcon width={20} height={20} class="cursor-pointer overflow-hidden rounded-md" />,
      value: 'ERNIE3'
    },
    {
      label: (
        <div class="flex items-center gap-1">
          <WenxinIcon width={20} height={20} class="cursor-pointer overflow-hidden rounded-md" />
          <span class="text-base text-text1">文心4</span>
        </div>
      ),
      icon: <WenxinIcon width={20} height={20} class="cursor-pointer overflow-hidden rounded-md" />,
      value: 'ERNIE4'
    },
    {
      label: (
        <div class="flex items-center gap-1">
          <ChatGptIcon width={20} height={20} class="cursor-pointer overflow-hidden rounded-md" />
          <span class="text-base text-text1">GPT3</span>
        </div>
      ),
      icon: (
        <ChatGptIcon width={20} height={20} class="cursor-pointer overflow-hidden rounded-md" />
      ),
      value: 'GPT3'
    },
    {
      label: (
        <div class="flex items-center gap-1">
          <ChatGptIcon width={20} height={20} class="cursor-pointer overflow-hidden rounded-md" />
          <span class="text-base text-text1">GPT4</span>
        </div>
      ),
      icon: (
        <ChatGptIcon width={20} height={20} class="cursor-pointer overflow-hidden rounded-md" />
      ),
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
        {options.find((opt) => opt.value === userData.selectedModel)?.icon ?? 'default value'}
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
            'w- absolute z-10 mt-3 grid w-44 grid-cols-2 grid-rows-2 gap-1 rounded-md bg-dark p-2 ' +
            props.position
          }
        >
          <For each={options}>
            {(option) => (
              <div
                class="cursor-pointer break-words rounded-lg p-1 hover:bg-gray"
                onClick={() => handleSelect(option)}
              >
                <div>{option.label}</div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
