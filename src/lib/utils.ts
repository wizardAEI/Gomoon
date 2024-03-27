import { ModelInterfaceType, Models, ModelsType, loadLMMap } from './langchain'

export const newChatLlamaForNode = async (config: { src: string; temperature: number }) => {
  const { ChatLlamaCpp } = await import('@langchain/community/chat_models/llama_cpp')
  return new ChatLlamaCpp({
    modelPath: config.src,
    temperature: config.temperature,
    gpuLayers: 64,
  })
}

export const loadLMMapForNode = async (
  model: Models
): Promise<{
  [key in ModelsType]: ModelInterfaceType
}> => {
  const modelMap = await loadLMMap(model)
  if (!model.Llama.src) return modelMap
  try {
    modelMap.Llama = await newChatLlamaForNode(model.Llama)
  } catch (e: unknown) {
    modelMap.Llama = {
      invoke() {
        throw new Error('Llama errored:', e as Error)
      }
    }
  }
  return modelMap
}
