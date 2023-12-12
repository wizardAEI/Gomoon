import Card from '@renderer/components/ui/Card'
import { settingStore, setIsOnTop, setModels, updateModelsToFile } from '../store/setting'
import Switch from '@renderer/components/ui/SwitchItem'
import Expand from '@renderer/components/ui/Expand'
import EditInput from '@renderer/components/ui/EditInput'
import { onCleanup, onMount } from 'solid-js'
import { unwrap } from 'solid-js/store'
export default function Setting() {
  onMount(() => {
    onCleanup(() => {
      updateModelsToFile()
    })
  })
  return (
    <div class="flex h-full select-none flex-col gap-3 p-4">
      <Card title="模型引擎配置" noPadding>
        <Expand title="ChatGPT系列">
          <EditInput
            label="apiKey"
            value={settingStore.models.OpenAI.apiKey}
            onSave={(v) => {
              const m = unwrap(settingStore.models)
              m.OpenAI.apiKey = v
              setModels(m)
            }}
          />
          <EditInput
            label="baseURL"
            value={settingStore.models.OpenAI.baseURL}
            onSave={(v) => {
              const m = unwrap(settingStore.models)
              m.OpenAI.baseURL = v
              setModels(m)
            }}
          />
        </Expand>
        <Expand title="文心系列">
          <EditInput
            label="apiKey"
            value={settingStore.models.BaiduWenxin.apiKey}
            onSave={(v) => {
              const m = unwrap(settingStore.models)
              m.BaiduWenxin.apiKey = v
              setModels(m)
            }}
          />
          <EditInput
            value={settingStore.models.BaiduWenxin.secretKey}
            label="secretKey"
            onSave={(v) => {
              const m = unwrap(settingStore.models)
              m.BaiduWenxin.secretKey = v
              setModels(m)
            }}
          />
        </Expand>
      </Card>
      <Card title="应用设置">
        <div>
          <Switch
            label="是否将应用置顶"
            hint="将应用置顶后也可以通过 cmd/ctrl + d 快速隐藏和唤起"
            checked={settingStore.isOnTop}
            onCheckedChange={(checked) => setIsOnTop(checked)}
          />
        </div>
      </Card>
    </div>
  )
}
