/**
 * AI-SDK provider - unified OpenAI format
 * 使用 /chat/completions 接口进行流式与非流式调用
 */
import type { ModelsConfig, Provider } from '../models-config'
import { streamChatCompletions, chatCompletions } from './stream-completions'
import type { LLMAdapter } from './types'

function createModelFromProvider(
  provider: Provider,
  modelId: string,
  temperature: number
): LLMAdapter {
  const baseURL = provider.baseURL || ''
  const apiKey = provider.apiKey || 'ollama'

  return {
    async streamInvoke(messages, options) {
      return streamChatCompletions(messages, {
        baseURL,
        apiKey,
        modelId,
        temperature,
        signal: options.signal,
        onToken: options.onToken,
        onEnd: options.onEnd,
        onError: options.onError
      })
    },
    async invoke(messages) {
      return chatCompletions(messages, { baseURL, apiKey, modelId, temperature })
    }
  }
}

/** Load AI-SDK models from enabledModels + providers (all OpenAI-compatible) */
export function loadAIProviders(model: ModelsConfig): Record<string, LLMAdapter> {
  const result: Record<string, LLMAdapter> = {}
  const providerMap = new Map(model.providers.map((p) => [p.id, p]))

  for (const em of model.enabledModels) {
    const provider = providerMap.get(em.providerId)
    if (!provider) continue
    try {
      result[em.id] = createModelFromProvider(provider, em.modelId, em.temperature)
    } catch {
      // skip invalid model
    }
  }
  return result
}
