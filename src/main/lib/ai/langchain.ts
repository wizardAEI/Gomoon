import EventEmitter from 'events'

import { ChatLlamaCpp } from '@langchain/community/chat_models/llama_cpp'

import { msgDict } from '../../../lib/langchain'
import { loadLMMapForNode } from '../../../lib/utils'
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
  if (options.llm === 'Llama') {
    const controller = new AbortController()
    emit.once('abort', () => {
      console.log('abort')
      controller.abort()
    })
    const llm = (await loadLMMapForNode(getLMConfig().models))['Llama'] as ChatLlamaCpp
    const stream = await llm.stream(options.msgs.map((msg) => msgDict[msg.role](msg.content)), {
      callbacks: [
        {
          handleLLMEnd(output) {
            console.log(output.generations[0][0])
          },
          handleLLMError(error) {
            throw error
          }
        }
      ],
      signal: controller.signal,
    })
    for await (const chunk of stream) {
      postMsgToMainWindow(`new content: ${chunk.content}`)
    }
  }
}

export async function stopLLM() {
  emit.emit('abort')
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
