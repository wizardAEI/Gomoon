import { useToast } from '@renderer/components/ui/Toast'
import { createSignal } from 'solid-js'
import { AssistantModel } from 'src/main/models/model'

export default function (props: {
  assistant: AssistantModel
  onCancel: () => void
  onSave: (a: AssistantModel) => void
}) {
  const [a, setA] = createSignal(props.assistant)
  const toast = useToast()
  function setField(key: keyof AssistantModel, value: any) {
    setA({
      ...a(),
      [key]: value
    })
  }
  return (
    <div class="relative m-4 flex flex-col gap-2 rounded-2xl  bg-dark p-4 duration-150">
      <span>助手名称</span>
      <input
        type="text"
        value={a().name}
        onChange={(e) => setField('name', e.currentTarget.value)}
        placeholder="助手名称"
      />
      <span>介绍</span>
      <input
        type="text"
        value={a().introduce ?? ''}
        onChange={(e) => setField('introduce', e.currentTarget.value)}
        placeholder="可不填"
      />
      <span>提示（Prompt）</span>
      <textarea
        rows={4}
        value={a().prompt}
        onChange={(e) => setField('prompt', e.currentTarget.value)}
        placeholder="告诉助手要做什么吧"
      />
      <div class="flex justify-around">
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
