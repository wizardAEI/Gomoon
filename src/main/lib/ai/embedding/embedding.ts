import { getResourcesPath } from '../..'

export function getEmbeddingModel() {
  return 'Xenova/jina-embeddings-v2-base-zh'
}

export async function embedding(text: string): Promise<Float32Array> {
  const { env, pipeline } = await import('@xenova/transformers')
  env.localModelPath = getResourcesPath('models/')
  env.backends.onnx.wasm.numThreads = 1
  env.backends.onnx.logLevel = 'info'
  const extractor = await pipeline('feature-extraction', getEmbeddingModel(), {
    model_file_name: 'model',
    local_files_only: true
  })
  const output = await extractor(text, { pooling: 'mean', normalize: true })
  return (output?.data as Float32Array) || []
}

export async function tokenize(text: string) {
  const { AutoTokenizer, env } = await import('@xenova/transformers')
  env.localModelPath = getResourcesPath('models/')
  env.backends.onnx.wasm.numThreads = 1
  env.backends.onnx.logLevel = 'info'
  let tokenizer = await AutoTokenizer.from_pretrained(getEmbeddingModel())
  // Run tokenization
  let text_inputs = tokenizer.encode(text)
  return text_inputs
}
