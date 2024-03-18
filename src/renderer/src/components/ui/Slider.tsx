import { Show, createSignal, onMount } from 'solid-js'

export default function (props: {
  onChange: (value: number) => void
  defaultValue?: number
  min?: number
  max?: number
  percentage?: boolean
}) {
  let container: HTMLDivElement | undefined
  let range: HTMLInputElement | undefined
  const [value, setValue] = createSignal(props.defaultValue || 70)
  const changeWidth = () => {
    const containerWidth = container?.getBoundingClientRect().width
    range!.style.width = `${
      (containerWidth! - 34) *
      ((value() - (props.min || 0)) / ((props.max || 100) - (props.min || 0)))
    }px`
  }
  onMount(() => {
    changeWidth()
  })
  const updateValue = (e: any) => {
    const value = e.target.value
    setValue(Number(value))
    const num = props.percentage ? Number(value) / 100 : Number(value)
    props.onChange(num)
    changeWidth()
  }
  return (
    <div class="relative flex w-full items-center gap-2" ref={container}>
      <div class="absolute left-[1px] h-2 rounded-l-full rounded-r-full bg-active" ref={range} />
      <input
        class="range-slider__range flex-1"
        type="range"
        value={props.defaultValue || 70}
        min={props.min || 0}
        max={props.max || 100}
        onInput={updateValue}
      />
      <span class="range-slider__value w-6">
        {
          <Show when={props.percentage} fallback={value()}>
            {value() / 100}
          </Show>
        }
      </span>
    </div>
  )
}
