import { Checkbox, CheckedState } from '@ark-ui/solid'
import CheckItem from '@renderer/components/ui/CheckItem'
import { createSignal } from 'solid-js'

export default function Setting() {
  const [checked, setChecked] = createSignal<CheckedState>(true)
  return (
    <div class="h-full p-4">
      <div class="dark-theme rounded-2xl bg-dark px-4 pb-6 pt-4">
        <div class="text-lg font-medium">应用设置</div>
        <div>
          <CheckItem
            label="是否将应用置顶"
            checkProps={{
              checked: checked(),
              onCheckedChange: (e) => setChecked(e.checked)
            }}
          />
        </div>
      </div>
    </div>
  )
}
