import { type JSXElement } from 'solid-js'

export default function ScrollBox(props: { children: JSXElement }) {
  return (
    <div
      ref={(dom) => {
        dom.classList.add('scrollbar-translucent')
        dom.classList.add('scrollbar-transparent')
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
      }}
      class="scrollbar-show -mx-2 h-full w-[calc(100%+16px)] flex-col items-center"
    >
      {props.children}
    </div>
  )
}
