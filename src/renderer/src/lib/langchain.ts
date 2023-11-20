import { ChatOpenAI } from 'langchain/chat_models/openai'
import { ChatPromptTemplate } from 'langchain/prompts'
import { openAIApiKey, baseURL } from './config.json'
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema'

export type Roles = 'human' | 'system' | 'ai'

const msgDict = {
  human: (s: string) => new HumanMessage(s),
  system: (s: string) => new SystemMessage(s),
  ai: (s: string) => new AIMessage(s)
} as const

export const gptInterface = (config: { modelName: string; baseUrl?: string }) => {
  // const model = new OpenAI({
  //   openAIApiKey,
  //   modelName: config.modelName,
  //   configuration: {
  //     baseURL: config.baseUrl || baseURL
  //   }
  // })
  const chat = new ChatOpenAI({
    openAIApiKey,
    modelName: config.modelName,
    configuration: {
      baseURL: config.baseUrl || baseURL
    }
  })
  return {
    async invoke(
      args: {
        [key: string]: string
      },
      systemTemplate: string,
      humanTemplate: string
    ) {
      const prompt = await ChatPromptTemplate.fromMessages([
        ['system', systemTemplate],
        ['human', humanTemplate]
      ]).formatMessages(args)
      return chat.call(prompt)
    },
    async chat(
      msgs: {
        role: Roles
        content: string
      }[]
    ) {
      return chat.call(msgs.map((msg) => msgDict[msg.role](msg.content)))
    }
  }
}

// FEAT: 翻译
export const translator = async (text: string) =>
  gptInterface({
    modelName: 'gpt-3.5-turbo-0613'
  }).invoke(
    {
      text
    },
    `分析我给你的内容，当我给你的是一段句子或者单词时，帮我翻译；当我给你一段代码报错信息时，帮我分析报错。
    当我希望你翻译时遵守：英文句子请翻译成中文；反之则将中文翻译成英文。不要多余的废话。
    当我希望你分析报错时，请根据给出的错误报告解释错误信息并分析错误原因。
    只有当你区分不了我的意图时，才同时进行翻译和分析报错。否则请只做一件事情。
    `,
    '{text}'
  )

// FEAT: 前端大师
export const frontendHelper = async (
  msgs: {
    role: Roles
    content: string
  }[]
) =>
  gptInterface({
    modelName: 'gpt-3.5-turbo-0613'
  }).chat([
    {
      role: 'system',
      content:
        '你是一名前端专家，了解前端的方方面面。熟悉 react，vue，solid-js，electron 等前端和跨端框架，并且对 nodejs 的生态和技术也非常熟悉。'
    },
    ...msgs
  ])
