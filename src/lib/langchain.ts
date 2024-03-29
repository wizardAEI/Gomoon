import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi'
import type { ChatLlamaCpp } from '@langchain/community/chat_models/llama_cpp'
import { ChatBaiduWenxin } from '@langchain/community/chat_models/baiduwenxin'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'

export type ModelInterfaceType =
  | ChatBaiduWenxin
  | ChatOpenAI
  | ChatAlibabaTongyi
  | ChatGoogleGenerativeAI
  | ChatLlamaCpp
  | {
      invoke: any
    }
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
  | 'ERNIE128K'
  | 'GPT3'
  | 'GPT4'
  | 'GPTCustom'
  | 'QWenTurbo'
  | 'QWenPlus'
  | 'QWenMax'
  | 'GeminiPro'
  | 'Llama'
  | 'Moonshot8k'
  | 'Moonshot32k'
  | 'Moonshot128k'

export const defaultModels = () =>
  ({
    OpenAI: {
      apiKey: '',
      baseURL: '',
      temperature: 0.7
    },
    BaiduWenxin: {
      apiKey: '',
      secretKey: '',
      temperature: 0.3
    },
    AliQWen: {
      apiKey: '',
      temperature: 0.3
    },
    Gemini: {
      apiKey: '',
      temperature: 0.3
    },
    Llama: {
      src: '',
      temperature: 0.3
    },
    Moonshot: {
      apiKey: '',
      temperature: 0.3
    }
  }) as Models

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

export const newGeminiModal = (
  config: { apiKey: string; temperature: number },
  modelName: string
) =>
  new ChatGoogleGenerativeAI({
    streaming: true,
    modelName,
    apiKey: config.apiKey || 'api-key',
    temperature: config.temperature
  })

export const newMoonshotModal = (
  config: { apiKey: string; temperature: number },
  modelName: string
) =>
  new ChatOpenAI({
    streaming: true,
    modelName,
    openAIApiKey: config.apiKey || 'api-key',
    temperature: config.temperature,
    configuration: {
      baseURL: 'https://api.moonshot.cn/v1'
    }
  })

// 判断当前是node环境还是浏览器环境
export const newChatLlama = (config: { src: string; temperature: number }) => {
  return {
    invoke() {
      throw new Error('Llama is not supported in browser')
    }
  }
}

export const loadLMMap = async (
  model: Models
): Promise<{
  [key in ModelsType]: ModelInterfaceType
}> => ({
  ERNIE3: newERNIEModal(model.BaiduWenxin, 'ERNIE-Speed-8K'),
  ERNIE4: newERNIEModal(model.BaiduWenxin, 'ERNIE-Bot-4'),
  ERNIE128K: newERNIEModal(model.BaiduWenxin, 'ERNIE-Speed-128K'),
  GPT3: newGPTModal(model.OpenAI, 'gpt-3.5-turbo-0125'),
  GPT4: newGPTModal(model.OpenAI, 'gpt-4-0125-preview'),
  GPTCustom: newGPTModal(model.OpenAI, model.OpenAI.customModel),
  QWenTurbo: newQWenModel(model.AliQWen, 'qwen-turbo'),
  QWenPlus: newQWenModel(model.AliQWen, 'qwen-plus'),
  QWenMax: newQWenModel(model.AliQWen, 'qwen-max'),
  GeminiPro: newGeminiModal(model.Gemini, 'gemini-pro-vision'),
  Moonshot8k: newMoonshotModal(model.Moonshot, 'moonshot-v1-8k'),
  Moonshot32k: newMoonshotModal(model.Moonshot, 'moonshot-v1-32k'),
  Moonshot128k: newMoonshotModal(model.Moonshot, 'moonshot-v1-128k'),
  // TODO: 适配Llama
  Llama: newChatLlama(model.Llama)
})

export const msgDict: {
  [key in 'human' | 'system' | 'ai']: (s: string) => any
} = {
  human: (s: string) => new HumanMessage(s),
  system: (s: string) => new SystemMessage(s),
  ai: (s: string) => new AIMessage(s)
}
