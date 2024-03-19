import { JSX, JSXElement, Show, createSignal } from 'solid-js'

function ExpandWrapper(props: { children: JSXElement; onChange: () => void }) {
  return (
    <div
      class="border-1 mt-2 flex cursor-pointer justify-center rounded-lg border-solid border-gray p-1 px-2 py-1 duration-200 hover:border-dark-con hover:bg-dark-con"
      onClick={props.onChange}
    >
      {props.children}
    </div>
  )
}

export default function (props: {
  title?: string | JSX.Element
  foldTitle?: string | JSX.Element
  children: JSXElement
}) {
  const [expanded, setExpanded] = createSignal(false)
  return (
    <div>
      <Show
        when={expanded()}
        fallback={
          <ExpandWrapper onChange={() => setExpanded(true)}>{props.title || '展开'}</ExpandWrapper>
        }
      >
        {props.children}
        <ExpandWrapper onChange={() => setExpanded(false)}>
          {props.foldTitle || '收起'}
        </ExpandWrapper>
      </Show>
    </div>
  )
}
