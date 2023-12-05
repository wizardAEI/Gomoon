import DownwardArrow from '@renderer/assets/icon/base/arrow/DownwardArrow'
import UpwardArrow from '@renderer/assets/icon/base/arrow/UpwardArrow'
import { JSXElement, Show, createSignal } from 'solid-js'
export default function Expand(props: { title: string; children: JSXElement }) {
  const [expanded, setExpanded] = createSignal(false)

  return (
    <div>
      <div
        onClick={() => setExpanded(!expanded())}
        class={` ${
          expanded() ? '' : 'hover:bg-dark-con'
        } group/expand mx-2 my-1 flex cursor-pointer justify-between rounded-lg bg-dark px-2 py-1 duration-200`}
      >
        <div>{props.title}</div>
        <Show
          when={expanded()}
          fallback={<DownwardArrow height={16} width={16} class="pt-[2px]" />}
        >
          <UpwardArrow height={16} width={16} class="pt-[2px]" />
        </Show>
      </div>
      <Show when={expanded()}>
        <div class="px-5">{props.children}</div>
      </Show>
    </div>
  )
}
