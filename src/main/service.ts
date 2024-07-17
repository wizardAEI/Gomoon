import { existsSync } from 'fs'

import { autoUpdater } from 'electron-updater'

import { fetchWithProgress } from './lib/utils'
import { postMsgToMainWindow } from './window'
import { getResourcesPath, saveFile } from './lib'

function downloadFile(url: string, fileName: string) {
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

export async function updateForMac() {
  const res = await autoUpdater.checkForUpdates()
  if (res === null) {
    return
  }
  let url = 'https://vip.123pan.cn/1830083732/update/'
  const fileName =
    'gomoon-' + res?.updateInfo?.version + (process.arch === 'x64' ? '-x64' : '-arm64') + '.dmg'
  url += fileName
  if (!res.updateInfo.version || !res.updateInfo.releaseDate) {
    return
  }
  downloadFile(url, fileName)
}

export function checkModels() {
  const modelPath = getResourcesPath(
    'models/Xenova/jina-embeddings-v2-base-zh/onnx/model_quantized.onnx'
  )
  console.log(modelPath)
  return existsSync(modelPath)
}

export async function downloadEmbeddingModel() {
  const modelPath = getResourcesPath(
    'models/Xenova/jina-embeddings-v2-base-zh/onnx/model_quantized.onnx'
  )
  console.log(modelPath)
  // const url = 'https://vip.123pan.cn/1830083732/update/resources/model_quantized.onnx'
  // downloadFile(url, 'embedding-model.zip')
}
