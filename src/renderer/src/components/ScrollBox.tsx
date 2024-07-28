import { createSignal, onCleanup, type JSXElement } from 'solid-js'

export default function ScrollBox(props: { children: JSXElement }) {
  const [needScroll, setNeedScroll] = createSignal(false)
  return (
    <div
      ref={(dom) => {
        setTimeout(() => {
          dom.classList.add('scrollbar-translucent')
          dom.classList.add('scrollbar-transparent')
        })
        let time: NodeJS.Timeout | null = null
        dom.onscrollend = () => {
          time = setTimeout(() => {
            dom.classList.add('scrollbar-translucent')
            setTimeout(() => {
              dom.classList.add('scrollbar-transparent')
            }, 1000)
          }, 2000)
        }
        dom.onscroll = () => {
          dom.classList.remove('scrollbar-translucent')
          dom.classList.remove('scrollbar-transparent')
          if (time) {
            clearTimeout(time)
          }
        }
        const children = dom.children[0]
        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.height > dom.clientHeight) {
              setNeedScroll(true)
            }
          }
        })
        resizeObserver.observe(children)
        onCleanup(() => resizeObserver.disconnect())
      }}
      class={'scrollbar-show h-full ' + (needScroll() ? 'w-[calc(100%+0.45rem)]' : 'w-full')}
    >
      <div class="flex w-full flex-col items-center">{props.children}</div>
    </div>
  )
}
