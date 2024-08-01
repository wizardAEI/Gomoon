import { join } from 'path'
import { existsSync, mkdirSync, rmdirSync, writeFileSync } from 'fs'

import { app } from 'electron'

const appDataPath = app.getPath('userData')

export function getEmbeddingModel() {
  return 'embedding/Xenova/jina-embeddings-v2-base-zh'
}

export async function embedding(text: string): Promise<Float32Array> {
  const { env, pipeline } = await import('@xenova/transformers')
  env.allowLocalModels = true
  env.localModelPath = appDataPath
  env.backends.onnx.wasm.numThreads = 1
  env.backends.onnx.logLevel = 'info'
  const extractor = await pipeline('feature-extraction', getEmbeddingModel(), {
    model_file_name: 'model',
    local_files_only: true
  })
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  return (output?.data as Float32Array) || []
}

let haveActivatedTokenizer = false
export async function activateTokenizer() {
  if (haveActivatedTokenizer) {
    return
  }
  if (existsSync(join(appDataPath, getEmbeddingModel()))) {
    haveActivatedTokenizer = true
    return
  }
  mkdirSync(join(appDataPath, getEmbeddingModel()), {
    recursive: true
  })
  const url = 'https://vip.123pan.cn/1830083732/update/embedding/Xenova/jina-embeddings-v2-base-zh/'
  const fileList = ['config.json', 'tokenizer.json', 'tokenizer_config.json']
  try {
    await Promise.all(
      fileList.map(async (fileName) => {
        const filePath = join(appDataPath, getEmbeddingModel(), fileName)
        const response = await fetch(url + fileName)
        if (response.status === 200) {
          const buffer = Buffer.from(await response.arrayBuffer())
          writeFileSync(filePath, buffer)
        } else {
          throw new Error('Failed to download file: ' + fileName)
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      })
    )
  } catch (e) {
    rmdirSync(join(appDataPath, getEmbeddingModel()), {
      recursive: true
    })
  }
  haveActivatedTokenizer = true
}

export async function tokenize(text: string) {
  if (!haveActivatedTokenizer) {
    return []
  }
  const { AutoTokenizer, env } = await import('@xenova/transformers')
  env.allowLocalModels = true
  env.localModelPath = appDataPath
  env.backends.onnx.wasm.numThreads = 1
  env.backends.onnx.logLevel = 'info'
  try {
    const tokenizer = await AutoTokenizer.from_pretrained(getEmbeddingModel())
    // Run tokenization
    const text_inputs = tokenizer.encode(text)
    return text_inputs
  } catch (e) {
    console.error(e)
    return []
  }
}
