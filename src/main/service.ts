import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

import { autoUpdater } from 'electron-updater'
import { app } from 'electron'

import { fetchWithProgress } from './lib/utils'
import { postMsgToMainWindow } from './window'
import { saveFile } from './lib'
import { getEmbeddingModel } from './lib/ai/embedding/embedding'
import { getMemories, initMemories } from './models'
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

export function checkModelsSvc() {
  return (
    existsSync(join(app.getPath('userData'), getEmbeddingModel(), 'onnx')) &&
    getMemories().length > 0
  )
}

export async function initMemoriesSvc() {
  const modelPath = join(app.getPath('userData'), getEmbeddingModel(), 'onnx')
  if (!existsSync(modelPath)) {
    mkdirSync(modelPath, { recursive: true })
    const url =
      'https://vip.123pan.cn/1830083732/update/embedding/Xenova/jina-embeddings-v2-base-zh/onnx/model_quantized.onnx'
    const buf = await fetchWithProgress(url, (loaded, total) => {
      postMsgToMainWindow('model-progress ' + `${Math.ceil((loaded / total) * 100)}%`)
    })
    writeFileSync(join(modelPath, 'model_quantized.onnx'), buf)
  }
  if (getMemories().length === 0) {
    await initMemories()
  } else {
    postMsgToMainWindow('progress ' + '100%')
  }
}
