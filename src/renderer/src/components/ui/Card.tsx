import { JSXElement } from 'solid-js'

export default function Card(props: { title: string; children: JSXElement; noPadding?: boolean }) {
  return (
    <div class="overflow-hidden rounded-2xl bg-dark">
      <div class="px-4 pt-4 font-medium text-text1">{props.title}</div>
      <div class={`${props.noPadding ? 'pb-4' : 'px-4 pb-6 pt-2 text-sm'}`}>{props.children}</div>
    </div>
  )
}
