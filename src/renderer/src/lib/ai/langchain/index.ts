import { type LLMResult } from 'langchain/schema'
import { BaseMessageChunk, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ModelInterfaceType } from '@lib/langchain'
import { userData } from '@renderer/store/user'
import {
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat
} from '@renderer/store/assistants'
import { msgDict } from '@lib/langchain'
import type { MessageContent } from 'langchain/schema'

import { models } from './models'

export type Roles = 'human' | 'system' | 'ai'

const createModel = (model: ModelInterfaceType) => {
  return {
    async answer(
      msg: {
        systemTemplate: string
        humanTemplate: MessageContent
      },
      option: {
        newTokenCallback: (content: string) => void
        endCallback?: (res: LLMResult) => void
        errorCallback?: (err: unknown) => void
        pauseSignal: AbortSignal
      }
    ) {
      const { systemTemplate, humanTemplate } = msg
      const msgs = [
        new SystemMessage(systemTemplate),
        new HumanMessage({
          content: humanTemplate
        })
      ] as unknown
      return model.invoke(msgs, {
        signal: option.pauseSignal,
        timeout: 1000 * 20,
        callbacks: [
          {
            handleLLMNewToken(token) {
              option.newTokenCallback(token)
            },
            handleLLMEnd(output) {
              option.endCallback?.(output)
            },
            handleLLMError(err) {
              option.errorCallback?.(err)
            }
          }
        ]
      })
    },
    async chat(
      msgs: {
        role: Roles
        content: MessageContent
      }[],
      option: {
        newTokenCallback: (content: string) => void
        endCallback?: (output: LLMResult) => void
        errorCallback?: (err: unknown) => void
        pauseSignal: AbortSignal
      }
    ) {
      return model.invoke(
        msgs.map((msg) => msgDict[msg.role](msg.content || '...')),
        {
          callbacks: [
            {
              handleLLMNewToken(token) {
                option.newTokenCallback(token)
              },
              handleLLMError(err, runId, parentRunId, tags) {
                console.error('chat error: ', err, runId, parentRunId, tags)
                option.errorCallback?.(err)
              },
              handleLLMEnd(output) {
                option.endCallback?.(output)
              }
            }
          ],
          signal: option.pauseSignal,
          timeout: 1000 * 20
        }
      )
    }
  }
}

// TODO: 读取 assistant 信息来生成，可以从本地读取，也可以从远程读取

/**
 * FEAT: 调用只能在node端执行的模型
 */
const callLLMFromNode = (
  msgs: {
    role: Roles
    content: MessageContent
  }[],
  option: {
    newTokenCallback: (content: string) => void
    endCallback?: (result: LLMResult) => void
    errorCallback?: (err: unknown) => void
    pauseSignal: AbortSignal
  }
) =>
  new Promise((resolve, reject) => {
    const remove = window.api.receiveMsg(async (_, msg: string) => {
      if (msg.startsWith('new content: ')) {
        const newContent = msg.replace(/^new content: /, '')
        option.newTokenCallback(newContent)
      }
    })
    window.api
      .callLLM({
        type: 'chat',
        llm: 'Llama',
        msgs: msgs.map((msg) => ({
          role: msg.role,
          content: msg.content as string
        }))
      })
      .then((res) => {
        option.endCallback?.({
          generations: []
        })
        resolve(res)
      })
      .catch(reject)
      .finally(remove)
  })

/**
 * FEAT: Answer Assistant
 */
export const ansAssistant = async (option: {
  question: MessageContent
  newTokenCallback: (content: string) => void
  endCallback?: (result: LLMResult) => void
  errorCallback?: (err: unknown) => void
  pauseSignal: AbortSignal
}) => {
  const a = getCurrentAssistantForAnswer()
  // TODO: 后期拓展，支持prompts
  const question = option.question
  if (a.type === 'ans' && a.prompts?.length) {
    // TODO: 支持和prompts进行结合得出最终的question
  }
  if (userData.selectedModel === 'Llama') {
    return callLLMFromNode(
      [
        {
          role: 'system',
          content: a.prompt
        },
        {
          role: 'human',
          content: question as string
        }
      ],
      option
    )
  }
  return createModel(models[userData.selectedModel]).answer(
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
    endCallback?: (result: LLMResult) => void
    errorCallback?: (err: unknown) => void
    pauseSignal: AbortSignal
  }
) => {
  if (userData.selectedModel === 'Llama') {
    return callLLMFromNode(
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
  return createModel(models[userData.selectedModel]).chat(
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

export const nonStreamingAssistant = async (question: string): Promise<BaseMessageChunk> => {
  return models[userData.selectedModel].invoke([msgDict['human'](question)])
}
