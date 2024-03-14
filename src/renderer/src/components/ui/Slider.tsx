import { createSignal } from 'solid-js'

export default function (props: { onChange: (value: number) => void }) {
  const [value, setValue] = createSignal(0)
  return <div>123</div>
}
