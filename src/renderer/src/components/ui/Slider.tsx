import { Show, createEffect, createSignal } from 'solid-js'

export default function (props: {
  onChange: (value: number) => void
  defaultValue?: number
  min?: number
  max?: number
  percentage?: boolean
}) {
  let container: HTMLDivElement | undefined
  let range: HTMLInputElement | undefined
  const [value, setValue] = createSignal(
    props.defaultValue !== undefined
      ? // eslint-disable-next-line solid/reactivity
        props.percentage
        ? props.defaultValue * 100
        : props.defaultValue
      : 70
  )
  createEffect(() => {
    const containerWidth = container?.getBoundingClientRect().width
    range!.style.width = `${
      (containerWidth! - 34) *
      ((value() - (props.min || 0)) / ((props.max || 100) - (props.min || 0)))
    }px`
  })
  const updateValue = (e: unknown) => {
    const value = ((e as { target: unknown }).target as HTMLInputElement).value
    setValue(Number(value))
    const num = props.percentage ? parseFloat((Number(value) / 100).toFixed(2)) : Number(value)
    props.onChange(num)
  }
  return (
    <div class="relative flex w-full items-center gap-2" ref={container}>
      <div class="absolute left-[0.5px] h-[9px] rounded-l-full bg-active" ref={range} />
      <input
        class="range-slider__range flex-1 border-gray"
        type="range"
        value={value()}
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
