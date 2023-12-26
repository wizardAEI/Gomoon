import ChatGptIcon from '@renderer/assets/icon/models/ChatGptIcon'
import WenxinIcon from '@renderer/assets/icon/models/WenxinIcon'
import QWenIcon from '@renderer/assets/icon/models/QWenIcon'
import { setSelectedModel, userData } from '@renderer/store/user'
import { createMemo, createSignal, For, JSXElement, onCleanup, Show } from 'solid-js'
import { ModelsType } from 'src/main/model/model'

export default function (props: { position: string; size?: number; translate?: string }) {
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
      label: <span class="text-sm leading-6 text-current">千问Turbo</span>,
      icon(size: number) {
        return (
          <QWenIcon
            width={size - 2}
            height={size - 2}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'QWenTurbo'
    },
    {
      label: <span class="text-sm leading-6 text-current">千问Plus</span>,
      icon(size: number) {
        return (
          <QWenIcon
            width={size - 2}
            height={size - 2}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'QWenPlus'
    },
    {
      label: <span class="text-sm leading-6 text-current">千问Max</span>,
      icon(size: number) {
        return (
          <QWenIcon
            width={size - 2}
            height={size - 2}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'QWenMax'
    },
    {
      label: <span class="text-base text-current">GPT3.5</span>,
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
  }
  const label = createMemo(() => {
    return (
      options.find((opt) => opt.value === userData.selectedModel)?.icon(props.size || 20) ?? (
        <ChatGptIcon />
      )
    )
  })
  return (
    <>
      <div
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
        class="flex cursor-pointer"
      >
        {label()}
      </div>
      <Show when={isOpen()}>
        <div
          class={`absolute z-10 mt-3 grid w-80 grid-cols-3 grid-rows-3 gap-1 rounded-md bg-dark p-2 shadow-center ${
            props.position
          } ${props.translate || ''}`}
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
    </>
  )
}
