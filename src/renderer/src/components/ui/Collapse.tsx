import DownwardArrow from '@renderer/assets/icon/base/arrow/DownwardArrow'
import UpwardArrow from '@renderer/assets/icon/base/arrow/UpwardArrow'
import { JSX, JSXElement, Show, createSignal } from 'solid-js'
export default function Collapse(props: { title: string | JSX.Element; children: JSXElement }) {
  const [collapsed, setCollapsed] = createSignal(true)

  return (
    <div>
      <div
        onClick={() => setCollapsed(!collapsed())}
        class={` ${
          collapsed() ? 'hover:bg-dark-con' : ''
        } group/expand my-1 flex cursor-pointer justify-between rounded-lg bg-dark px-2 py-1 text-sm duration-200`}
      >
        <div>{props.title}</div>
        <Show
          when={!collapsed()}
          fallback={<DownwardArrow height={16} width={16} class="pt-[2px]" />}
        >
          <UpwardArrow height={16} width={16} class="pt-[2px]" />
        </Show>
      </div>
      <Show when={!collapsed()}>
        <div class="px-3">{props.children}</div>
      </Show>
    </div>
  )
}
