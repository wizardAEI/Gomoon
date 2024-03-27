import { ChatLlamaCpp } from '@langchain/community/chat_models/llama_cpp'

import { msgDict } from '../../../lib/langchain'
import { loadLMMapForNode } from '../../../lib/utils'
import { getUserData, loadAppConfig } from '../../models'

function getLMConfig() {
  return {
    models: loadAppConfig().models,
    current: getUserData().selectedModel
  }
}

export interface CallLLmOption {
  llm: string
  modelName: string
  msgs: {
    type: 'human' | 'system' | 'ai'
    content: string
  }[]
  type: 'ans' | 'chat'
}
export async function callLLm(options: CallLLmOption) {
  if (options.llm === 'llama') {
    const llm = (await loadLMMapForNode(getLMConfig().models))['Llama'] as ChatLlamaCpp
    const stream = await llm.stream(options.msgs.map((msg) => msgDict[msg.type](msg.content)))
    for await (const chunk of stream) {
      console.log(chunk.content)
    }
  }
}

export async function lmInvoke(option: { system?: string; content: string }): Promise<string> {
  const lm = (await loadLMMapForNode(getLMConfig().models))[getLMConfig().current]
  if (!lm) {
    throw new Error('llm not found')
  }
  const msgs = [msgDict['human'](option.content)]
  if (option.system) msgs.unshift(msgDict['system'](option.system))
  try {
    const res = await lm.invoke(msgs)
    return res.content as string
  } catch (e: unknown) {
    throw new Error('llm error', e as Error)
  }
}
