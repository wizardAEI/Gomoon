import { useToast } from '@renderer/components/ui/Toast'
import { systemStore } from '@renderer/store/setting'
import { createEffect } from 'solid-js'

export default function System() {
  const toast = useToast()
  createEffect(() => {
    if (systemStore.updateStatus.haveDownloaded) {
      toast.confirm('新版本下载完成，是否安装（升级后会自动启动）').then((res) => {
        if (res) {
          window.api.quitForUpdate()
        }
      })
    }
  })
  return <></>
}
