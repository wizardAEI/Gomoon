import { Tooltip } from '@ark-ui/solid'
import QuestionMarkIcon from '@renderer/assets/icon/base/QuestionMarkIcon'
import { Portal } from 'solid-js/web'
export default function QuestionMention(props: {
  size?: number
  color?: string
  content: string
  fill?: string
}) {
  return (
    <div class="inline-block">
      <Tooltip.Root
        openDelay={200}
        closeDelay={300}
        positioning={{
          placement: 'top'
        }}
      >
        <Tooltip.Trigger class="flex h-full cursor-pointer items-center rounded-full border-0">
          <QuestionMarkIcon
            fill={props.fill || '#a7a8bd'}
            class="scale-[118%]"
            width={props.size || 14}
            height={props.size || 14}
          />
        </Tooltip.Trigger>
        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>
              <div class="rounded-md bg-white p-1 text-xs">{props.content}</div>
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
    </div>
  )
}
