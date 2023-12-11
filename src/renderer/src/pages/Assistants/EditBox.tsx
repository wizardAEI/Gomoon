import { createSignal } from 'solid-js'
import { AssistantModel } from 'src/main/model/model'

export default function (props: {
  assistant: AssistantModel
  onCancel: () => void
  onSave: (a: AssistantModel) => void
}) {
  const [a, setA] = createSignal(props.assistant)
  function setField(key: keyof AssistantModel, value: any) {
    setA({
      ...a(),
      [key]: value
    })
  }
  return (
    <div class="relative m-4 flex flex-col gap-2 rounded-2xl border-2 border-solid border-active bg-dark p-4 duration-150">
      <span>助手名称</span>
      <input
        type="text"
        value={a().name}
        onChange={(e) => setField('name', e.currentTarget.value)}
      />
      <span>介绍</span>
      <input
        type="text"
        value={a().introduce ?? ''}
        onChange={(e) => setField('introduce', e.currentTarget.value)}
      />
      <span>助手prompt（提示）</span>
      <textarea
        rows={4}
        value={a().prompt}
        onChange={(e) => setField('prompt', e.currentTarget.value)}
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
            props.onSave(a())
          }}
        >
          保存
        </button>
      </div>
    </div>
  )
}
