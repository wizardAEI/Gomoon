import { useToast } from '@renderer/components/ui/Toast'
import { systemStore } from '@renderer/store/setting'
import { createEffect } from 'solid-js'

export default function System() {
  const toast = useToast()
  createEffect(async () => {
    if (systemStore.updateStatus.haveDownloaded) {
      const res = await toast.confirm('新版本下载完成，是否安装')
      if (res) {
        window.api.quitForUpdate()
      }
    }
  })
  return <></>
}
