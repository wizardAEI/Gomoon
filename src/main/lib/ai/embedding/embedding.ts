import { getResourcesPath } from '../..'

export async function embedding(text: string) {
  const { AutoTokenizer, CLIPTextModelWithProjection, env } = await import('@xenova/transformers')
  env.localModelPath = getResourcesPath('models')
  env.backends.onnx.wasm.numThreads = 1
  env.cacheDir = getResourcesPath('cache')
  let tokenizer = await AutoTokenizer.from_pretrained('Xenova/bert-base-chinese')
  const text_model = await CLIPTextModelWithProjection.from_pretrained('Xenova/bert-base-chinese', {
    model_file_name: 'model'
  })
  // Run tokenization
  let text_inputs = tokenizer([text], { padding: true, truncation: true })
  // Compute embeddings
  const res = await text_model(text_inputs)
  console.log(res.logits.data)
}
// import { Pipeline } from '@xenova/transformers'
// class EmbeddingPipeline {
//   static task = 'text-classification'
//   static model = 'Xenova/bert-base-chinese'
//   static instance: null | Promise<Pipeline> = null
//   static async getInstance() {
//     if (this.instance === null) {
//       let { pipeline, env } = await import('@xenova/transformers')
//       env.localModelPath = getResourcesPath('models')
//       env.backends.onnx.wasm.numThreads = 1
//       this.instance = pipeline('feature-extraction', this.model)
//     }
//     return this.instance
//   }
// }

// export async function embedding(text: string) {
//   const res = await (
//     await EmbeddingPipeline.getInstance()
//   )(text, { pooling: 'mean', normalize: true })
//   console.log(res)
//   return res
// }
