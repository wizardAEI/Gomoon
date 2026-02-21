import EventEmitter from 'events'

import { loadLMMapForNode } from './llm'
import { getUserData, loadAppConfig } from '../../models'
import { postMsgToMainWindow } from '../../window'

const emit = new EventEmitter()

function getLMConfig() {
  return {
    models: loadAppConfig().models,
    current: getUserData().selectedModel
  }
}

export interface CallLLmOption {
  llm: string
  modelName?: string
  msgs: {
    role: 'human' | 'system' | 'ai'
    content: string
  }[]
  type: 'ans' | 'chat'
}

export async function callLLM(options: CallLLmOption) {
  const modelId = options.llm || getLMConfig().current
  const llmMap = await loadLMMapForNode(getLMConfig().models)
  const llm = llmMap[modelId]
  if (!llm) throw new Error(`模型 ${modelId} 未找到`)
  const controller = new AbortController()
  emit.once('abort', () => controller.abort())
  await llm.streamInvoke(
    options.msgs.map((msg) => ({ role: msg.role as 'human' | 'system' | 'ai', content: msg.content })),
    {
      onToken: (output) => postMsgToMainWindow(`new content: ${output}`),
      onError: (error) => {
        throw error
      },
      signal: controller.signal
    }
  )
}

export async function stopLLM() {
  emit.emit('abort')
}

export async function lmInvoke(option: { system?: string; content: string }): Promise<string> {
  const llmMap = await loadLMMapForNode(getLMConfig().models)
  const lm = llmMap[getLMConfig().current]
  if (!lm) {
    throw new Error('llm not found')
  }
  const msgs: Array<{ role: 'human' | 'system' | 'ai'; content: string }> = [
    { role: 'human', content: option.content }
  ]
  if (option.system) msgs.unshift({ role: 'system', content: option.system })
  try {
    const res = await lm.invoke(msgs)
    return res.content
  } catch (e: unknown) {
    throw new Error('llm error', e as Error)
  }
}
