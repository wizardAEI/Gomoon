import {
  LLMResult,
  HumanMessage,
  SystemMessage,
  AIMessage,
  BaseMessageChunk
} from 'langchain/schema'
import { ModelInterfaceType, models } from './models'
import { userData } from '@renderer/store/user'
import {
  getCurrentAssistantForAnswer,
  getCurrentAssistantForChat
} from '@renderer/store/assistants'

export type Roles = 'human' | 'system' | 'ai'

const msgDict = {
  human: (s: string) => new HumanMessage(s),
  system: (s: string) => new SystemMessage(s),
  ai: (s: string) => new AIMessage(s)
} as const

const createModel = (chat: ModelInterfaceType) => {
  return {
    async answer(
      msg: {
        systemTemplate: string
        humanTemplate: string
      },
      option: {
        newTokenCallback: (content: string) => void
        endCallback?: () => void
        errorCallback?: (err: any) => void
        pauseSignal: AbortSignal
      }
    ) {
      const { systemTemplate, humanTemplate } = msg
      const msgs = [new SystemMessage(systemTemplate), new HumanMessage(humanTemplate)]
      return chat.invoke(msgs, {
        signal: option.pauseSignal,
        timeout: 1000 * 20,
        callbacks: [
          {
            handleLLMNewToken(token) {
              option.newTokenCallback(token)
            },
            handleLLMEnd() {
              option.endCallback?.()
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
        content: string
      }[],
      option: {
        newTokenCallback: (content: string) => void
        endCallback?: (output: LLMResult) => void
        errorCallback?: (err: any) => void
        pauseSignal: AbortSignal
      }
    ) {
      return chat.invoke(
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
 * FEAT: Answer Assistant
 */
export const ansAssistant = async (option: {
  question: string
  newTokenCallback: (content: string) => void
  endCallback?: () => void
  errorCallback?: (err: any) => void
  pauseSignal: AbortSignal
}): Promise<BaseMessageChunk> => {
  const a = getCurrentAssistantForAnswer()
  // TODO: 后期拓展，支持 preContent 和 postContent
  const preContent = a.type === 'ans' ? a.preContent ?? '' : ''
  const postContent = a.type === 'ans' ? a.postContent ?? '' : ''
  return createModel(models[userData.selectedModel]).answer(
    {
      systemTemplate: a.prompt,
      humanTemplate: `${preContent}${option.question}${postContent}`
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
    content: string
  }[],
  option: {
    newTokenCallback: (content: string) => void
    endCallback?: () => void
    errorCallback?: (err: any) => void
    pauseSignal: AbortSignal
  }
): Promise<BaseMessageChunk> =>
  createModel(models[userData.selectedModel]).chat(
    [
      {
        role: 'system',
        content: getCurrentAssistantForChat().prompt
      },
      ...msgs
    ],
    option
  )

export const nonStreamingAssistant = async (question: string): Promise<BaseMessageChunk> => {
  return models[userData.selectedModel].invoke([msgDict['human'](question)])
}
