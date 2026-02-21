import { debounce } from 'lodash';
import { Show, createEffect, createSignal } from 'solid-js';
export default function (props) {
    let container;
    let range;
    const [value, setValue] = createSignal(props.value !== undefined ? (props.percentage ? props.value * 100 : props.value) : 70);
    createEffect(() => {
        const containerWidth = container?.getBoundingClientRect().width;
        range.style.width = `${(containerWidth - 34) *
            ((value() - (props.min || 0)) / ((props.max || 100) - (props.min || 0)))}px`;
    });
    const change = debounce((num) => props.onChange(num), 300);
    const updateValue = (e) => {
        const value = e.target.value;
        setValue(Number(value));
        const num = props.percentage ? parseFloat((Number(value) / 100).toFixed(2)) : Number(value);
        change(num);
    };
    return (<div class="relative flex w-full items-center gap-2" ref={container}>
      <div class="absolute left-[0.5px] h-[9px] rounded-l-full bg-active" ref={range}/>
      <input class="range-slider__range flex-1 border-gray" type="range" value={value()} min={props.min || 0} max={props.max || 100} onInput={updateValue}/>
      <span class="range-slider__value w-6">
        {<Show when={props.percentage} fallback={value()}>
            {value() / 100}
          </Show>}
      </span>
    </div>);
}
