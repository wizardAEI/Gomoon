import { autoUpdater } from 'electron-updater'

import { fetchWithProgress } from './lib/utils'
import { postMsgToMainWindow } from './window'
import { saveFile } from './lib'
export async function updateForMac() {
  const res = await autoUpdater.checkForUpdates()
  if (res === null) {
    return
  }
  let url = 'https://vip.123pan.cn/1830083732/update/'
  const fileName =
    'gomoon-' + res?.updateInfo?.version + (process.arch === 'x64' ? '-x64' : '-arm64') + '.dmg'
  url += fileName
  // FEAT: 流式下载文件，返回进度
  fetchWithProgress(url, (loaded, total) => {
    postMsgToMainWindow('download-progress ' + Math.ceil((loaded / total) * 100))
  })
    .then((buf) => {
      postMsgToMainWindow('update-downloaded')
      saveFile(fileName, buf)
    })
    .catch((error) => {
      console.error('Fetch error:', error)
    })
}
