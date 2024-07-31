import { modelDict } from '@lib/langchain'
import { getModelOptions } from '@renderer/components/MainSelections/ModelSelect'
import QuestionMention from '@renderer/components/ui/QuestionMention'
import Select from '@renderer/components/ui/Select'
import { useToast } from '@renderer/components/ui/Toast'
import { createSignal } from 'solid-js'
import type { JSXElement } from 'solid-js'
import { AssistantModel } from 'src/main/models/model'

function Field(props: { title: string; children: JSXElement }) {
  return (
    <div class="my-2 flex flex-col gap-2">
      <span class="font-medium">{props.title}</span>
      {props.children}
    </div>
  )
}

function FlexField(props: { title: string | JSXElement; children: JSXElement }) {
  return (
    <div class="item-center relative mb-2 mt-3 flex justify-between">
      <span class="font-medium">{props.title}</span>
      {props.children}
    </div>
  )
}

export default function (props: {
  assistant: AssistantModel
  onCancel: () => void
  onSave: (a: AssistantModel) => void
}) {
  // eslint-disable-next-line solid/reactivity
  const [a, setA] = createSignal(props.assistant)
  const toast = useToast()
  function setField(key: keyof AssistantModel, value: unknown) {
    setA({
      ...a(),
      [key]: value
    })
  }
  const options = getModelOptions().map((m) => ({
    label: modelDict[m.value].label,
    value: m.value
  }))
  return (
    <div class="relative mx-2 my-4 rounded-2xl bg-dark p-4 duration-150">
      <Field title="助手名称">
        <input
          type="text"
          value={a().name}
          onChange={(e) => setField('name', e.currentTarget.value)}
          placeholder="助手名称"
        />
      </Field>
      <FlexField
        title={
          <div class="flex gap-1">
            助手偏好模型
            <QuestionMention content="选择助手偏好模型后，下次使用助手时，将自动切换该模型" />
          </div>
        }
      >
        <div class="absolute right-0 w-[120px]">
          <Select
            defaultValue={a().matchModel || 'current'}
            options={[
              {
                value: 'current',
                label: '跟随当前模型'
              },
              ...options
            ]}
            onSelect={(v) => {
              setField('matchModel', v)
            }}
          />
        </div>
      </FlexField>
      <Field title="介绍">
        <input
          type="text"
          value={a().introduce ?? ''}
          onChange={(e) => setField('introduce', e.currentTarget.value)}
          placeholder="可不填"
        />
      </Field>
      <Field title="提示（Prompt）">
        <textarea
          rows={4}
          value={a().prompt}
          onChange={(e) => setField('prompt', e.currentTarget.value)}
          placeholder="告诉助手要做什么吧"
        />
      </Field>
      <div class="mt-3 flex justify-around">
        <button
          class="duration-300 hover:bg-active"
          onClick={() => {
            props.onCancel()
          }}
        >
          取消
        </button>
        <button
          class="duration-300 hover:bg-active"
          onClick={() => {
            if (!a().name) {
              toast.warning('助手名称不能为空')
              return
            }
            if (!a().prompt) {
              toast.warning('提示不能为空')
              return
            }
            props.onSave(a())
          }}
        >
          保存
        </button>
      </div>
    </div>
  )
}
