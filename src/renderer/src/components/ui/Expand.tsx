import { JSX, JSXElement, Show, createSignal } from 'solid-js'

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
          <div>
            <div
              class="flex cursor-pointer justify-center rounded-lg p-1 px-2 py-1 hover:bg-dark-con"
              onClick={() => setExpanded(true)}
            >
              {props.title || '展开'}
            </div>
          </div>
        }
      >
        {props.children}
        <div
          class="flex cursor-pointer justify-center rounded-lg p-1 px-2 py-1 hover:bg-dark-con"
          onClick={() => setExpanded(false)}
        >
          {props.foldTitle || '收起'}
        </div>
      </Show>
    </div>
  )
}
