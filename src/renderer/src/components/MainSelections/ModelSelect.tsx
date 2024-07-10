import ChatGptIcon from '@renderer/assets/icon/models/ChatGptIcon'
import WenxinIcon from '@renderer/assets/icon/models/WenxinIcon'
import QWenIcon from '@renderer/assets/icon/models/QWenIcon'
import { setSelectedModel, userData } from '@renderer/store/user'
import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js'
import type { JSXElement } from 'solid-js'
import { settingStore } from '@renderer/store/setting'
import { ModelsType, modelDict } from '@lib/langchain'
import GeminiIcon from '@renderer/assets/icon/models/GeminiIcon'
import KimiIcon from '@renderer/assets/icon/models/KimiIcon'
import LlamaIcon from '@renderer/assets/icon/models/LlamaIcon'
import OllamaIcon from '@renderer/assets/icon/models/OllamaIcon'
import CustomIcon from '@renderer/assets/icon/models/CustomIcon'

export function getModelOptions(): {
  label: JSXElement
  icon: (size: number) => JSXElement
  value: ModelsType
}[] {
  const options: {
    label: JSXElement
    icon: (size: number) => JSXElement
    value: ModelsType
  }[] = [
    {
      label: <span class="text-base text-current">{modelDict['GPT3'].label}</span>,
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
      label: <span class="text-base text-current">{modelDict['GPT4'].label}</span>,
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

  if (settingStore.models.OpenAI.customModel) {
    options.push({
      label: <span class="text-base text-current">{modelDict['GPTCustom'].label}</span>,
      icon(size: number) {
        return (
          <ChatGptIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GPTCustom'
    })
  }

  options.push(
    {
      label: <span class="text-base text-current">{modelDict['ERNIE3'].label}</span>,
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
      label: <span class="text-base text-current">{modelDict['ERNIE4'].label}</span>,
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
      label: <span class="text-sm text-current">{modelDict['ERNIE128K'].label}</span>,
      icon(size: number) {
        return (
          <WenxinIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'ERNIE128K'
    }
  )

  if (settingStore.models.AliQWen.apiKey) {
    options.push(
      {
        label: <span class="text-sm leading-6 text-current">{modelDict['QWenTurbo'].label}</span>,
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
        label: <span class="text-sm leading-6 text-current">{modelDict['QWenMax'].label}</span>,
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
        label: <span class="text-sm leading-6 text-current">{modelDict['QWenLong'].label}</span>,
        icon(size: number) {
          return (
            <QWenIcon
              width={size - 2}
              height={size - 2}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'QWenLong'
      }
    )
  }

  if (settingStore.models.Gemini.apiKey) {
    options.push({
      label: <span class="text-sm leading-6 text-current">{modelDict['GeminiPro'].label}</span>,
      icon(size: number) {
        return (
          <GeminiIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GeminiPro'
    })
  }

  if (settingStore.models.Gemini.customModel) {
    options.push({
      label: <span class="text-base text-current">{modelDict['GeminiCustom'].label}</span>,
      icon(size: number) {
        return (
          <GeminiIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'GeminiCustom'
    })
  }

  if (settingStore.models.Moonshot.apiKey) {
    options.push(
      {
        label: <span class="text-sm leading-6 text-current">{modelDict['Moonshot8k'].label}</span>,
        icon(size: number) {
          return (
            <KimiIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'Moonshot8k'
      },
      {
        label: <span class="text-sm leading-6 text-current">{modelDict['Moonshot32k'].label}</span>,
        icon(size: number) {
          return (
            <KimiIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'Moonshot32k'
      },
      {
        label: (
          <span class="text-sm leading-6 text-current">{modelDict['Moonshot128k'].label}</span>
        ),
        icon(size: number) {
          return (
            <KimiIcon
              width={size}
              height={size}
              class="cursor-pointer overflow-hidden rounded-md"
            />
          )
        },
        value: 'Moonshot128k'
      }
    )
  }

  if (settingStore.models.Llama.src) {
    options.push({
      label: <span class="text-base leading-6 text-current">{modelDict['Llama'].label}</span>,
      icon(size: number) {
        return (
          <LlamaIcon
            width={size - 1}
            height={size - 1}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'Llama'
    })
  }

  if (settingStore.models.Ollama.address && settingStore.models.Ollama.model) {
    options.push({
      label: <span class="text-base leading-6 text-current">{modelDict['Ollama'].label}</span>,
      icon(size: number) {
        return (
          <OllamaIcon
            width={size - 1}
            height={size - 1}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'Ollama'
    })
  }

  if (settingStore.models.CustomModel.customModel && settingStore.models.CustomModel.apiKey) {
    options.push({
      label: <span class="text-sm leading-6 text-current">{modelDict['CustomModel'].label}</span>,
      icon(size: number) {
        return (
          <CustomIcon
            width={size}
            height={size}
            class="cursor-pointer overflow-hidden rounded-md"
          />
        )
      },
      value: 'CustomModel'
    })
  }
  return options
}

export default function (props: { position: string; size?: number; translate?: string }) {
  const options = getModelOptions()
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
          class={`absolute z-10 mt-3 flex  flex-wrap gap-1 rounded-md bg-dark-plus p-2 shadow-center ${
            props.position
          } ${props.translate || ''} ${options.length > 4 ? 'w-[324px]' : 'w-[220px]'}`}
        >
          <For each={options}>
            {(option) => (
              <div
                class={`w-[100px] cursor-pointer break-words rounded-lg py-1 pl-1 pr-0 ${
                  userData.selectedModel === option.value ? 'bg-active' : ''
                } hover:bg-active
                `}
                onClick={() => handleSelect(option)}
              >
                <div
                  class={`flex select-none items-center gap-1 duration-100 ${userData.selectedModel === option.value ? 'text-text-active' : 'text-text1'}`}
                >
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
