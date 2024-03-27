import { type JSXElement, Show, createSignal } from 'solid-js'

// FEAT: 让点击可以有反馈
export const compWithTip = (
  fn: (tip: (status: 'success' | 'fail', label: string) => void) => JSXElement,
  position?: 'right' | 'left'
): JSXElement => {
  const [tipModal, setTipModal] = createSignal<{
    status: '' | 'success' | 'fail'
    label: string
  }>({
    status: '',
    label: ''
  })
  const tip = (status: 'success' | 'fail', label: string) => {
    setTipModal({
      status,
      label
    })
    setTimeout(() => {
      setTipModal({
        status: '',
        label: ''
      })
    }, 1000)
  }
  const Comp = fn(tip)
  return (
    <div
      class={`relative flex overflow-visible ${
        position === 'right' ? 'justify-end' : 'justify-start'
      }`}
    >
      <Show when={tipModal().label}>
        {tipModal().status === 'success' && (
          <div class="absolute top-[-8px] -mx-4 h-1 animate-popup whitespace-nowrap text-slate-50">
            {tipModal().label || '成功!'}
          </div>
        )}
        {tipModal().status === 'fail' && (
          <div class="text-slate-50-mx-4 absolute top-[-8px] h-1 animate-popup whitespace-nowrap">
            {tipModal().label || '失败!'}
          </div>
        )}
      </Show>
      {Comp}
    </div>
  )
}
