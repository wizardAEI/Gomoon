export default function Card(props) {
    return (<div class="rounded-2xl bg-dark">
      <div class="px-4 pt-4 text-base font-medium text-text1">{props.title}</div>
      <div class={`${props.noPadding ? 'pb-4' : 'px-4 pb-6 pt-2 text-sm'}`}>{props.children}</div>
    </div>);
}
