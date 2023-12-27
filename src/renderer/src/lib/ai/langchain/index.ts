import { ChatPromptTemplate } from 'langchain/prompts'
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema'
import { ModelInterfaceType, models } from './models'
import { LLMChain } from 'langchain/chains'
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
      const prompt = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemTemplate),
        new HumanMessage(humanTemplate)
      ])
      const chain = new LLMChain({
        llm: chat,
        prompt
      })
      return chain.call(
        {
          signal: option.pauseSignal,
          timeout: 1000 * 20
        },
        {
          callbacks: [
            {
              handleLLMNewToken(token) {
                option.newTokenCallback(token)
              },
              handleLLMEnd() {
                option.endCallback?.()
              },
              handleLLMError(err, runId, parentRunId, tags) {
                option.errorCallback?.(err)
                console.error('answer error: ', err, runId, parentRunId, tags)
              }
            }
          ]
        }
      )
    },
    async chat(
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
    ) {
      return chat.call(
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
              handleLLMEnd() {
                option.endCallback?.()
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
}) => {
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
) =>
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

export const nonStreamingAssistant = async (question: string) => {
  return models[userData.selectedModel].call([msgDict['human'](question)])
}
