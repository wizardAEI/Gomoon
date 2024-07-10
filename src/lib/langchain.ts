import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi'
import type { ChatLlamaCpp } from '@langchain/community/chat_models/llama_cpp'
import { ChatBaiduWenxin } from '@langchain/community/chat_models/baiduwenxin'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import type { BaseMessage, MessageContent } from 'langchain/schema'
import { ChatOpenAI, OpenAIClient } from '@langchain/openai'
import { isArray } from 'lodash'

import { base64ToFile } from './utils_web'

export type ModelInterfaceType =
  | ChatBaiduWenxin
  | ChatOpenAI
  | ChatAlibabaTongyi
  | ChatGoogleGenerativeAI
  | ChatLlamaCpp
  | ChatOllama
  | {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    customModel: string
    temperature: number
  }
  Llama: {
    src: string
    temperature: number
  }
  Ollama: {
    address: string
    model: string
    temperature: number
  }
  // kimi
  Moonshot: {
    apiKey: string
    baseURL: string
    temperature: number
  }
  CustomModel: {
    apiKey: string
    baseURL: string
    temperature: number
    customModel: string
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
  | 'QWenLong'
  | 'QWenMax'
  | 'GeminiPro'
  | 'GeminiCustom'
  | 'Llama'
  | 'Moonshot8k'
  | 'Moonshot32k'
  | 'Moonshot128k'
  | 'Ollama'
  | 'CustomModel'

export const modelDict: {
  [key in ModelsType]: { maxToken: number; label: string }
} = {
  GPT3: {
    label: 'GPT 3.5',
    maxToken: 16385
  },
  GPT4: {
    label: 'GPT 4.0',
    maxToken: 128000
  },
  ERNIE3: {
    maxToken: 11200,
    label: '文心 3.5'
  },
  ERNIE4: {
    label: '文心 4.0',
    maxToken: 9600
  },
  ERNIE128K: {
    label: '文心 128K',
    maxToken: 128000
  },
  GPTCustom: {
    label: 'ChatGPT',
    maxToken: 0
  },
  QWenTurbo: {
    label: '千问Turbo',
    maxToken: 6000
  },
  QWenLong: {
    label: '千问Long',
    maxToken: 10000000
  },
  QWenMax: {
    label: '千问Max',
    maxToken: 6000
  },
  GeminiPro: {
    label: 'Gemini Pro',
    maxToken: 30720
  },
  GeminiCustom: {
    label: 'Gemini',
    maxToken: 0
  },
  Moonshot128k: {
    label: 'KIMI 128k',
    maxToken: 128000
  },
  Moonshot8k: {
    label: 'KIMI 8k',
    maxToken: 8000
  },
  Moonshot32k: {
    label: 'KIMI 32k',
    maxToken: 32000
  },
  Llama: {
    label: 'Llama',
    maxToken: 0
  },
  Ollama: {
    label: 'Ollama',
    maxToken: 0
  },
  CustomModel: {
    label: '自定义模型',
    maxToken: 0
  }
}

export const defaultModels: () => Models = () => ({
  OpenAI: {
    apiKey: '',
    baseURL: '',
    customModel: '',
    temperature: 0.3
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
    temperature: 0.3,
    customModel: ''
  },
  Llama: {
    src: '',
    temperature: 0.3
  },
  Ollama: {
    address: '',
    model: '',
    temperature: 0.3
  },
  Moonshot: {
    baseURL: '',
    apiKey: '',
    temperature: 0.3
  },
  CustomModel: {
    baseURL: '',
    apiKey: '',
    customModel: '',
    temperature: 0.3
  }
})

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

export const newQWenModelV2 = (
  config: { apiKey: string; temperature: number; baseURL?: string },
  modelName: string
) =>
  new ChatOpenAI({
    streaming: true,
    modelName,
    openAIApiKey: config.apiKey || 'api-key',
    temperature: config.temperature,
    topP: 0.75,
    configuration: {
      baseURL: config.baseURL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    }
  })

export const newGeminiModel = (
  config: { apiKey: string; temperature: number },
  modelName: string
) =>
  new ChatGoogleGenerativeAI({
    streaming: true,
    modelName: modelName || 'gemini-pro',
    apiKey: config.apiKey || 'api-key',
    temperature: config.temperature
  })

export const newMoonshotModel = (
  config: { apiKey: string; temperature: number; baseURL: string },
  modelName: string
) => {
  const moonshot = new ChatOpenAI({
    streaming: true,
    modelName,
    openAIApiKey: config.apiKey || 'api-key',
    temperature: config.temperature,
    configuration: {
      baseURL: config.baseURL || 'https://api.moonshot.cn/v1'
    }
  })
  const client = new OpenAIClient({
    apiKey: config.apiKey || 'api-key',
    baseURL: config.baseURL || 'https://api.moonshot.cn/v1',
    dangerouslyAllowBrowser: true
  })
  const oldInvoke = moonshot.invoke.bind(moonshot)
  moonshot.invoke = async (...args) => {
    const msgs = args[0] as any
    if (isArray(msgs)) {
      for (const msg of msgs) {
        const content = msg.content
        if (isArray(content)) {
          for (const c of content) {
            if (c.type === 'image_url') {
              const base64 = c.image_url.url as string
              const file = base64ToFile(base64, 'image')
              const file_object = await client.files.create({
                file,
                purpose: 'file-extract' as any
              })
              const file_content = await (await client.files.content(file_object.id)).text()
              c.type = 'text'
              c.text = file_content
            }
          }
        }
      }
    }
    return oldInvoke(...args)
  }
  return moonshot
}

// 判断当前是node环境还是浏览器环境
export const newChatLlama = (config: { src: string; temperature: number }) => {
  return {
    invoke() {
      throw new Error('Llama is not supported in browser')
    }
  }
}

export const newOllamaModel = (config: { address: string; model: string; temperature: number }) => {
  const chatOllama = new ChatOllama({
    model: config.model,
    baseUrl: config.address,
    temperature: config.temperature
  })
  const oldInvoke = chatOllama.invoke.bind(chatOllama)
  chatOllama.invoke = async (...args) => {
    for (let i = 0; i < (args[0] as BaseMessage[]).length; i++) {
      const content = (args[0][i] as BaseMessage).content
      if (isArray(content)) {
        content.forEach((c) => {
          if (c.type === 'image_url') {
            c.image_url = (c.image_url as { url: string }).url
          }
        })
      }
      ;(args[0][i] as BaseMessage).content = content
    }
    return oldInvoke(...args)
  }
  return chatOllama
}

export const newCustomModel = (model: Models['CustomModel']) =>
  new ChatOpenAI({
    streaming: true,
    modelName: model.customModel,
    openAIApiKey: model.apiKey || 'api-key',
    temperature: model.temperature,
    configuration: {
      baseURL: model.baseURL
    }
  })

export const loadLMMap = async (
  model: Models
): Promise<{
  [key in ModelsType]: ModelInterfaceType
}> => ({
  ERNIE3: newERNIEModal(model.BaiduWenxin, 'ERNIE-Speed-8K'),
  ERNIE4: newERNIEModal(model.BaiduWenxin, 'ERNIE-Bot-4'),
  ERNIE128K: newERNIEModal(model.BaiduWenxin, 'ERNIE-Speed-128K'),
  GPT3: newGPTModal(model.OpenAI, 'gpt-3.5-turbo'),
  GPT4: newGPTModal(model.OpenAI, 'gpt-4o'),
  GPTCustom: newGPTModal(model.OpenAI, model.OpenAI.customModel),
  QWenTurbo: newQWenModel(model.AliQWen, 'qwen-turbo'),
  QWenMax: newQWenModel(model.AliQWen, 'qwen-max'),
  QWenLong: newQWenModelV2(model.AliQWen, 'qwen-long'),
  GeminiPro: newGeminiModel(model.Gemini, 'gemini-pro'),
  GeminiCustom: newGeminiModel(model.Gemini, model.Gemini.customModel),
  Moonshot8k: newMoonshotModel(model.Moonshot, 'moonshot-v1-8k'),
  Moonshot32k: newMoonshotModel(model.Moonshot, 'moonshot-v1-32k'),
  Moonshot128k: newMoonshotModel(model.Moonshot, 'moonshot-v1-128k'),
  Llama: newChatLlama(model.Llama),
  Ollama: newOllamaModel(model.Ollama),
  CustomModel: newCustomModel(model.CustomModel)
})

export const msgDict: {
  [key in 'human' | 'system' | 'ai']: (c: MessageContent) => any
} = {
  human: (c: MessageContent) =>
    new HumanMessage({
      content: c
    }),
  system: (c: MessageContent) =>
    new SystemMessage({
      content: c
    }),
  ai: (c: MessageContent) =>
    new AIMessage({
      content: c
    })
}
