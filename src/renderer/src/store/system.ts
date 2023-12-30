import { createMemo } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

// FEAT: 一些用户无法感知的系统级别的操作，例如软件更新状态
export interface SystemStore {
  updateStatus: {
    canUpdate: boolean
    haveDownloaded: boolean
    updateProgress: number
    version: string
  }
}

const [systemStore, setSystemStore] = createStore<SystemStore>({
  updateStatus: {
    canUpdate: false,
    haveDownloaded: false,
    updateProgress: 0,
    version: ''
  }
})
export function setUpdaterStatus(status: Partial<SystemStore['updateStatus']>) {
  setSystemStore(
    produce((s) => {
      s.updateStatus = {
        ...s.updateStatus,
        ...status
      }
    })
  )
}

export const updateStatusLabel = createMemo(() => {
  const dict = {
    canUpdate: '有新版本,点击下载！',
    updateProgress:
      '下载中: ' + systemStore.updateStatus.updateProgress + '%（请不要中途退出应用）',
    haveDownloaded: '新版本下载完成,立即安装！'
  }
  let label = '检查更新'
  for (const key in dict) {
    if (systemStore.updateStatus[key]) {
      label = dict[key]
    }
  }
  return label
})

export async function updateVersion() {
  if (systemStore.updateStatus.haveDownloaded) {
    window.api.quitForUpdate()
    return true
  }
  if (
    systemStore.updateStatus.updateProgress > 0 &&
    systemStore.updateStatus.updateProgress < 100
  ) {
    return true
  }
  if (systemStore.updateStatus.canUpdate) {
    setUpdaterStatus({ updateProgress: 1 })
    window.api.downloadUpdate().then((res) => {
      if (res.length) {
        setUpdaterStatus({ haveDownloaded: true })
      }
    })
    return true
  }
  const res = await window.api.checkUpdate()
  if (res) {
    setUpdaterStatus({ canUpdate: true })
  } else {
    return false
  }
  return true
}

export { systemStore }
