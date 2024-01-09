import { getResourcesPath } from '../..'

export async function embedding(text: string) {
  const { AutoTokenizer, CLIPTextModelWithProjection, env } = await import('@xenova/transformers')
  env.localModelPath = getResourcesPath('models/')
  env.backends.onnx.wasm.numThreads = 1
  env.backends.onnx.logLevel = 'info'
  let tokenizer = await AutoTokenizer.from_pretrained('Xenova/bert-base-chinese')
  const text_model = await CLIPTextModelWithProjection.from_pretrained('Xenova/bert-base-chinese', {
    model_file_name: 'model'
  })
  // Run tokenization
  let text_inputs = tokenizer([text], { padding: true, truncation: true })
  // Compute embeddings
  const res = await text_model(text_inputs)
  return res.legits.data
}
