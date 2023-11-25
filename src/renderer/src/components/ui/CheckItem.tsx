import { Checkbox, CheckboxProps } from '@ark-ui/solid'
import QuestionMention from './QuestionMention'

export default function CheckItem(props: {
  label: string
  hint?: string
  checkProps: CheckboxProps
}) {
  return (
    <div>
      <Checkbox.Root {...props.checkProps}>
        <Checkbox.Label>
          <div class="flex items-center gap-1">
            {props.label}
            <QuestionMention content="将应用置顶后也可以通过 cmd/ctrl + d 快速隐藏和唤起" />
          </div>
        </Checkbox.Label>
        <Checkbox.Control class="h-2 bg-white" />
      </Checkbox.Root>
    </div>
  )
}
