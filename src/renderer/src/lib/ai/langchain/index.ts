import type { MessageContent, GenerateResult } from '@lib/ai-sdk'
import { userData } from '@renderer/store/user'
import {
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat
} from '@renderer/store/assistants'

import { models } from './models'

export type Roles = 'human' | 'system' | 'ai'

const createModelAdapter = (model: (typeof models)[keyof typeof models]) => {
  return {
    async answer(
      msg: {
        systemTemplate: string
        humanTemplate: MessageContent
      },
      option: {
        newTokenCallback: (content: string) => void
        endCallback?: (res: GenerateResult) => void
        errorCallback?: (err: unknown) => void
        pauseSignal: AbortSignal
      }
    ) {
      const msgs = [
        { role: 'system' as const, content: msg.systemTemplate },
        { role: 'human' as const, content: msg.humanTemplate }
      ]
      return model.streamInvoke(msgs, {
        signal: option.pauseSignal,
        onToken: option.newTokenCallback,
        onEnd: option.endCallback,
        onError: option.errorCallback
      })
    },
    async chat(
      msgs: {
        role: Roles
        content: MessageContent
      }[],
      option: {
        newTokenCallback: (content: string) => void
        endCallback?: (output: GenerateResult) => void
        errorCallback?: (err: unknown) => void
        pauseSignal: AbortSignal
      }
    ) {
      const chatMsgs = msgs.map((msg) => ({
        role: msg.role,
        content: msg.content || '...'
      }))
      return model.streamInvoke(chatMsgs, {
        onToken: option.newTokenCallback,
        onEnd: option.endCallback,
        onError: option.errorCallback,
        signal: option.pauseSignal
      })
    }
  }
}

/**
 * FEAT: Answer Assistant
 */
export const ansAssistant = async (option: {
  question: MessageContent
  newTokenCallback: (content: string) => void
  endCallback?: (result: GenerateResult) => void
  errorCallback?: (err: unknown) => void
  pauseSignal: AbortSignal
}) => {
  const a = getCurrentAssistantForAnswer()
  const question = option.question
  if (a.type === 'ans' && a.prompts?.length) {
    // TODO: 支持和prompts进行结合得出最终的question
  }
  const model = models[userData.selectedModel]
  if (!model) throw new Error(`模型 ${userData.selectedModel} 未找到`)
  return createModelAdapter(model).answer(
    {
      systemTemplate: a.prompt,
      humanTemplate: question
    },
    option
  )
}

/**
 * FEAT: Chat Assistant
 */
export const chatAssistant = async (
  msgs: {
    role: Roles
    content: MessageContent
  }[],
  option: {
    newTokenCallback: (content: string) => void
    endCallback?: (result: GenerateResult) => void
    errorCallback?: (err: unknown) => void
    pauseSignal: AbortSignal
  }
) => {
  const model = models[userData.selectedModel]
  if (!model) throw new Error(`模型 ${userData.selectedModel} 未找到`)
  return createModelAdapter(model).chat(
    [
      {
        role: 'system',
        content: getCurrentAssistantForChat().prompt
      },
      ...msgs
    ],
    option
  )
}

export const nonStreamingAssistant = async (question: string): Promise<{ content: string }> => {
  const model = models[userData.selectedModel]
  if (!model) throw new Error(`模型 ${userData.selectedModel} 未找到`)
  const result = await model.invoke([
    { role: 'human' as const, content: question }
  ])
  return { content: result.content }
}
