/**
 * Bridge: wraps LangChain models (Baidu, Ollama, Llama) to LLMAdapter interface
 */
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import type { LLMAdapter, ChatMessage, GenerateResult } from './types'
import type { MessageContent } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LangChainModel = { invoke: (msgs: any[], opts?: any) => Promise<any>; stream?: (msgs: any[], opts?: any) => AsyncIterable<any> }

function contentToString(content: ChatMessage['content']): string {
  if (typeof content === 'string') return content
  const arr = content as Array<{ type: string; text?: string }>
  return arr.map((c) => (c.type === 'text' && c.text ? c.text : '')).join('')
}

function toLangChainMessages(messages: ChatMessage[]) {
  return messages.map((msg) => {
    const content = msg.content
    if (msg.role === 'system') {
      return new SystemMessage(contentToString(content))
    }
    if (msg.role === 'ai') {
      return new AIMessage(contentToString(content))
    }
    return new HumanMessage({ content: content as MessageContent })
  })
}

export function createLangChainBridge(lcModel: LangChainModel): LLMAdapter {
  return {
    async streamInvoke(
      messages: ChatMessage[],
      options: {
        onToken?: (token: string) => void
        onEnd?: (output: GenerateResult) => void
        onError?: (err: unknown) => void
        signal?: AbortSignal
      }
    ): Promise<GenerateResult | null> {
      const lcMsgs = toLangChainMessages(messages)
      try {
        const res = await lcModel.invoke(lcMsgs, {
          signal: options.signal,
          callbacks: [
            {
              handleLLMNewToken(token: string) {
                options.onToken?.(token)
              },
              handleLLMError(err: unknown) {
                options.onError?.(err)
              }
            }
          ]
        })
        const content = typeof res?.content === 'string' ? res.content : ''
        options.onEnd?.({ content, generations: [] })
        return { content, generations: [] }
      } catch (err) {
        options.onError?.(err)
        throw err
      }
    },

    async invoke(messages: ChatMessage[]): Promise<GenerateResult> {
      const lcMsgs = toLangChainMessages(messages)
      const res = await lcModel.invoke(lcMsgs)
      const content = typeof res?.content === 'string' ? res.content : ''
      return { content, generations: [] }
    }
  }
}
