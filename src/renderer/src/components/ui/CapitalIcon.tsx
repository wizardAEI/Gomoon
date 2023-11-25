import { Tooltip } from '@ark-ui/solid'
import { Portal } from 'solid-js/web'
export default function CapitalIcon(props: { size?: number; content: string }) {
  const firstChat = props.content.charAt(0)

  return (
    <div>
      <Tooltip.Root openDelay={200} closeDelay={300}>
        <Tooltip.Trigger
          class="bg-purple flex items-center justify-center rounded-md border-0 text-[12px] font-bold leading-3 "
          style={{
            width: props.size ? `${props.size}px` : '16px',
            height: props.size ? `${props.size}px` : '16px'
          }}
        >
          <div class="cursor-pointer overflow-hidden text-slate-200 duration-200 hover:text-slate-100">
            {firstChat}
          </div>
        </Tooltip.Trigger>
        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>
              <div class="rounded-md bg-white/70 p-1 text-xs">{props.content}</div>
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
    </div>
  )
}
