import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi'
import { ChatBaiduWenxin } from '@langchain/community/chat_models/baiduwenxin'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'

export type ModelInterfaceType = ChatBaiduWenxin | ChatOpenAI | ChatAlibabaTongyi
export interface Models {
  OpenAI: {
    apiKey: string
    baseURL: string
    customModel: string
    temperature: number
  }
  BaiduWenxin: {
    apiKey: string
    secretKey: string
    temperature: number
  }
  AliQWen: {
    apiKey: string
    temperature: number
  }
  Gemini: {
    apiKey: string
    temperature: number
  }
  Llama: {
    src: string
    temperature: number
  }
  // kimi
  Moonshot: {
    apiKey: string
    temperature: number
  }
}
export type ModelsType =
  | 'ERNIE3'
  | 'ERNIE4'
  | 'GPT3'
  | 'GPT4'
  | 'QWenTurbo'
  | 'QWenPlus'
  | 'QWenMax'

export const newERNIEModal = (
  config: {
    apiKey: string
    secretKey: string
    temperature: number
  },
  modelName: string
) =>
  new ChatBaiduWenxin({
    streaming: true,
    modelName,
    baiduApiKey: config.apiKey || 'api-key',
    baiduSecretKey: config.secretKey || 'secret-key',
    temperature: config.temperature
  })

export const newGPTModal = (
  config: { apiKey: string; baseURL: string; temperature: number },
  modelName: string
) =>
  new ChatOpenAI({
    streaming: true,
    modelName,
    openAIApiKey: config.apiKey || 'api-key',
    temperature: config.temperature,
    configuration: {
      baseURL: config.baseURL
    }
  })

export const newQWenModel = (
  config: { apiKey: string; temperature: number; enableSearch?: boolean },
  modelName: string
) =>
  new ChatAlibabaTongyi({
    streaming: true,
    modelName,
    alibabaApiKey: config.apiKey || 'api-key',
    temperature: config.temperature,
    enableSearch: config.enableSearch
  })

export const defaultModels = () =>
  ({
    OpenAI: {
      apiKey: 'api-key',
      baseURL: '',
      temperature: 0.7
    },
    BaiduWenxin: {
      apiKey: 'api-key',
      secretKey: 'secret-key',
      temperature: 0.7
    },
    AliQWen: {
      apiKey: '',
      temperature: 0.7
    }
  }) as Models

export const loadLMMap = (
  model: Models
): {
  [key in ModelsType]: ModelInterfaceType
} => ({
  ERNIE3: newERNIEModal(model.BaiduWenxin, 'ERNIE-Bot-turbo'),
  ERNIE4: newERNIEModal(model.BaiduWenxin, 'ERNIE-Bot-4'),
  GPT3: newGPTModal(model.OpenAI, 'gpt-3.5-turbo-0125'),
  GPT4: newGPTModal(model.OpenAI, 'gpt-4-0125-preview'),
  QWenTurbo: newQWenModel(model.AliQWen, 'qwen-turbo'),
  QWenPlus: newQWenModel(model.AliQWen, 'qwen-plus'),
  QWenMax: newQWenModel(model.AliQWen, 'qwen-max')
})

export const msgDict = {
  human: (s: string) => new HumanMessage(s),
  system: (s: string) => new SystemMessage(s),
  ai: (s: string) => new AIMessage(s)
} as const
