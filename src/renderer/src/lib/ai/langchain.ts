import { ChatBaiduWenxin } from 'langchain/chat_models/baiduwenxin'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ChatPromptTemplate } from 'langchain/prompts'
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema'
import { ModelsType, models } from './models'

export type Roles = 'human' | 'system' | 'ai'

const msgDict = {
  human: (s: string) => new HumanMessage(s),
  system: (s: string) => new SystemMessage(s),
  ai: (s: string) => new AIMessage(s)
} as const

const createModel = (chat: ChatBaiduWenxin | ChatOpenAI) => {
  return {
    async answer(
      msg: {
        systemTemplate: string
        humanTemplate: string
        args: {
          [key: string]: string
        }
      },
      option: {
        newTokenCallback: (content: string) => void
        endCallback?: () => void
        errorCallback?: (err: any) => void
        pauseSignal: AbortSignal
      }
    ) {
      const { args, systemTemplate, humanTemplate } = msg
      const prompt = await ChatPromptTemplate.fromMessages([
        ['system', systemTemplate],
        ['human', humanTemplate || '...']
      ]).formatMessages(args)
      return chat.call(prompt, {
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
        ],
        signal: option.pauseSignal,
        timeout: 1000 * 10
      })
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
          signal: option.pauseSignal
        }
      )
    }
  }
}

let currentModelType: ModelsType = 'GPT4Modal'

// TODO: 读取 bot 信息来生成，可以从本地读取，也可以从远程读取

// FEAT: 翻译 / 分析报错
export const translator = async (
  args: {
    [key: string]: string
  },
  option: {
    newTokenCallback: (content: string) => void
    endCallback?: () => void
    errorCallback?: (err: any) => void
    pauseSignal: AbortSignal
  }
) => {
  return createModel(models[currentModelType]).answer(
    {
      systemTemplate: `分析我给你的内容，当我给你的是一段句子或者单词时，帮我翻译；当我给你一段代码或终端报错信息时，帮我分析报错。
      当我希望你翻译时遵守：英文句子请翻译成中文；反之则将中文翻译成英文。不要多余的废话。
      当我希望你分析报错时，请根据给出的错误报告解释错误信息并分析错误原因。
      只有当你区分不了我的意图时，才同时进行翻译和分析报错。否则请只做一件事情。
      `,
      humanTemplate: '{text}',
      args
    },
    option
  )
}

// FEAT: 前端大师
export const frontendHelper = async (
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
  createModel(models[currentModelType]).chat(
    [
      {
        role: 'system',
        content:
          '你是一名前端专家，了解前端的方方面面。熟悉 react，vue，solid-js，electron 等前端和跨端框架，并且对 nodejs 的生态和技术也非常熟悉。'
      },
      ...msgs
    ],
    option
  )
