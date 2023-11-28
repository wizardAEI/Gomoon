import { settingStore, setIsOnTop } from '../store/setting'
import Switch from '@renderer/components/ui/SwitchItem'
export default function Setting() {
  return (
    <div class="h-full select-none p-4">
      <div class="dark-theme rounded-2xl bg-dark px-4 pb-6 pt-4">
        <div class="text-lg font-medium">应用设置</div>
        <div>
          <Switch
            label="是否将应用置顶"
            hint="将应用置顶后也可以通过 cmd/ctrl + d 快速隐藏和唤起"
            checked={settingStore.isOnTop}
            onCheckedChange={(checked) => setIsOnTop(checked)}
          />
        </div>
      </div>
    </div>
  )
}
