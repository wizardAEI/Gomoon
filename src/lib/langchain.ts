import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi'
import type { ChatLlamaCpp } from '@langchain/community/chat_models/llama_cpp'
import { ChatBaiduQianfan } from '@langchain/baidu-qianfan'
import { ChatOllama } from '@langchain/ollama'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import type { BaseMessage, MessageContent } from 'langchain/schema'
import { ChatOpenAI, OpenAIClient } from '@langchain/openai'
import { ChatDeepSeek } from '@langchain/deepseek'
import { isArray } from 'lodash'
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai'

import { base64ToFile } from './utils_web'

export type ModelInterfaceType =
  | ChatBaiduQianfan
  | ChatOpenAI
  | ChatAlibabaTongyi
  | ChatGoogleGenerativeAI
  | ChatLlamaCpp
  | ChatOllama
  | ChatAnthropic
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
  DeepSeek: {
    apiKey: string
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
    model1: string
    model2: string
    temperature: number
  }
  Moonshot: {
    apiKey: string
    baseURL: string
    temperature: number
  }
  Claude: {
    apiKey: string
    baseURL: string
    temperature: number
  }
  CustomModel: {
    models: {
      apiKey: string
      baseURL: string
      temperature: number
      customModel: string
    }[]
    selectModel: string
  }
}
export type ModelsType =
  | 'ERNIE3'
  | 'ERNIE4'
  | 'ERNIE128K'
  | 'GPT4'
  | 'GPTMINI'
  | 'GPT41'
  | 'GPT41MINI'
  | 'GPT41NANO'
  | 'GPTCustom'
  | 'DeepSeekChat'
  | 'DeepSeekReasoner'
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
  | 'Ollama1'
  | 'Ollama2'
  | 'ClaudeSonnet'
  | 'ClaudeOpus'
  | 'ClaudeHaiku'
  | 'CustomModel'

export const modelDict: {
  [key in ModelsType]: { label: string; maxToken: number }
} = {
  GPTMINI: {
    label: 'GPT-4 Mini',
    maxToken: 128000
  },
  GPT4: {
    label: 'GPT-4o',
    maxToken: 128000
  },
  GPT41: {
    label: 'GPT-4.1',
    maxToken: 1032000
  },
  GPT41MINI: {
    label: 'GPT-4.1 Mini',
    maxToken: 1032000
  },
  GPT41NANO: {
    label: 'GPT-4.1 Nano',
    maxToken: 1032000
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
  DeepSeekChat: {
    label: 'DeepSeek V3',
    maxToken: 128000
  },
  DeepSeekReasoner: {
    label: 'DeepSeek R1',
    maxToken: 128000
  },
  GPTCustom: {
    label: 'ChatGPT 自定义',
    maxToken: 0
  },
  QWenTurbo: {
    label: '千问 Turbo',
    maxToken: 6000
  },
  QWenLong: {
    label: '千问 Long',
    maxToken: 10000000
  },
  QWenMax: {
    label: '千问 Max',
    maxToken: 6000
  },
  GeminiPro: {
    label: 'Gemini Pro',
    maxToken: 30720
  },
  GeminiCustom: {
    label: 'Gemini 自定义',
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
    label: 'Llama CPP',
    maxToken: 0
  },
  Ollama: {
    label: 'Ollama',
    maxToken: 0
  },
  Ollama1: {
    label: 'Ollama 备用1',
    maxToken: 0
  },
  Ollama2: {
    label: 'Ollama 备用2',
    maxToken: 0
  },
  ClaudeSonnet: {
    label: 'Claude Sonnet',
    maxToken: 200000
  },
  ClaudeOpus: {
    label: 'Claude Opus',
    maxToken: 200000
  },
  ClaudeHaiku: {
    label: 'Claude Haiku',
    maxToken: 200000
  },
  CustomModel: {
    label: 'Custom Model',
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
  DeepSeek: {
    apiKey: '',
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
    model1: '',
    model2: '',
    temperature: 0.3
  },
  Moonshot: {
    baseURL: '',
    apiKey: '',
    temperature: 0.3
  },
  Claude: {
    baseURL: '',
    apiKey: '',
    temperature: 0.3
  },
  CustomModel: {
    models: [
      {
        baseURL: '',
        apiKey: '',
        customModel: '',
        temperature: 0.3
      }
    ],
    selectModel: ''
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
  new ChatBaiduQianfan({
    streaming: true,
    modelName,
    qianfanAK: config.apiKey || 'api-key',
    qianfanSK: config.secretKey || 'secret-key',
    temperature: config.temperature
  })

export const newGPTModal = (
  config: { apiKey: string; baseURL: string; temperature: number },
  modelName: string
) => {
  return new ChatOpenAI({
    streaming: true,
    modelName,
    openAIApiKey: config.apiKey || 'api-key',
    temperature: config.temperature,
    configuration: {
      baseURL: config.baseURL
    }
  })
}

export const newDeepSeekModel = (
  config: { apiKey: string; temperature: number },
  modelName: string
) => {
  const deepSeek = new ChatDeepSeek({
    streaming: true,
    modelName,
    apiKey: config.apiKey || 'api-key',
    temperature: config.temperature,
    configuration: {
      baseURL: 'https://api.deepseek.com/v1'
    }
  })
  deepSeek.invoke = async (...args) => {
    const stream = await deepSeek.stream(args[0], {
      signal: args[1]?.signal as AbortSignal,
      callbacks: [
        {
          handleLLMEnd(output) {
            args?.[1]?.callbacks?.[0]?.handleLLMEnd?.(output)
          },
          handleLLMError(err) {
            args?.[1]?.callbacks?.[0]?.handleLLMError?.(err)
          }
        }
      ]
    })
    let reasoning_staus = 0 // 0 未开始，1 推理中，2 推理结束
    for await (const chunk of stream) {
      if (chunk.additional_kwargs.reasoning_content) {
        if (reasoning_staus === 0) {
          reasoning_staus = 1
          args?.[1]?.callbacks?.[0]?.handleLLMNewToken?.('> ')
        }
        // 遇到了回车的时候，需要适配在回车前面加上 >
        if ((chunk.additional_kwargs.reasoning_content as string).includes('\n')) {
          args?.[1]?.callbacks?.[0]?.handleLLMNewToken?.(
            (chunk.additional_kwargs.reasoning_content as string).replaceAll('\n', '\n> ')
          )
        } else {
          args?.[1]?.callbacks?.[0]?.handleLLMNewToken?.(chunk.additional_kwargs.reasoning_content)
        }
      }
      if (chunk.content) {
        if (reasoning_staus === 1) {
          reasoning_staus = 2
        }
        args?.[1]?.callbacks?.[0]?.handleLLMNewToken?.(chunk.content)
      }
    }
    return null as any
  }
  return deepSeek
}

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
    modelName: modelName || 'gemini-1.5-pro',
    apiKey: config.apiKey || 'api-key',
    temperature: config.temperature,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      }
    ]
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
    const msgs = args[0] as unknown
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      throw new Error('Llama is not supported in browser: ' + JSON.stringify(config))
    }
  }
}

export const newOllamaModel = (config: Models['Ollama'], index = 0) => {
  const arr = ['model', 'model1', 'model2'] as const
  const chatOllama = new ChatOllama({
    model: config[arr[index]],
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

export const newClaudeModel = (config: Models['Claude'], modelName: string) =>
  new ChatAnthropic({
    maxTokens: 10000, // TODO: 后续优化，找到合适的token数量
    streaming: true,
    anthropicApiKey: config.apiKey || 'api-key',
    model: modelName,
    temperature: config.temperature,
    anthropicApiUrl: config.baseURL
  })

export const newCustomModel = (model: Models['CustomModel']) => {
  const current = model.models.find((m) => m.customModel === model.selectModel) || model.models[0]
  return new ChatOpenAI({
    streaming: true,
    modelName: current.customModel,
    openAIApiKey: current.apiKey || 'api-key',
    temperature: current.temperature,
    configuration: {
      baseURL: current.baseURL
    }
  })
}

export const loadLMMap = async (
  model: Models
): Promise<{
  [key in ModelsType]: ModelInterfaceType
}> => ({
  ERNIE3: newERNIEModal(model.BaiduWenxin, 'ERNIE-3.5-8K'),
  ERNIE4: newERNIEModal(model.BaiduWenxin, 'ERNIE-Bot-4'),
  ERNIE128K: newERNIEModal(model.BaiduWenxin, 'ERNIE-Speed-128K'),
  GPTMINI: newGPTModal(model.OpenAI, 'gpt-4o-mini'),
  GPT4: newGPTModal(model.OpenAI, 'gpt-4o'),
  GPT41: newGPTModal(model.OpenAI, 'gpt-4.1'),
  GPT41MINI: newGPTModal(model.OpenAI, 'gpt-4.1-mini'),
  GPT41NANO: newGPTModal(model.OpenAI, 'gpt-4.1-nano'),
  DeepSeekChat: newDeepSeekModel(model.DeepSeek, 'deepseek-chat'),
  DeepSeekReasoner: newDeepSeekModel(model.DeepSeek, 'deepseek-reasoner'),
  GPTCustom: newGPTModal(model.OpenAI, model.OpenAI.customModel),
  QWenTurbo: newQWenModel(model.AliQWen, 'qwen-turbo'),
  QWenMax: newQWenModel(model.AliQWen, 'qwen-max'),
  QWenLong: newQWenModelV2(model.AliQWen, 'qwen-long'),
  GeminiPro: newGeminiModel(model.Gemini, 'gemini-1.5-pro'),
  GeminiCustom: newGeminiModel(model.Gemini, model.Gemini.customModel),
  Moonshot8k: newMoonshotModel(model.Moonshot, 'moonshot-v1-8k'),
  Moonshot32k: newMoonshotModel(model.Moonshot, 'moonshot-v1-32k'),
  Moonshot128k: newMoonshotModel(model.Moonshot, 'moonshot-v1-128k'),
  Llama: newChatLlama(model.Llama),
  Ollama: newOllamaModel(model.Ollama),
  Ollama1: newOllamaModel(model.Ollama, 1),
  Ollama2: newOllamaModel(model.Ollama, 2),
  ClaudeHaiku: newClaudeModel(model.Claude, 'claude-3-haiku-20240307'),
  ClaudeSonnet: newClaudeModel(model.Claude, 'claude-3-5-sonnet-20240620'),
  ClaudeOpus: newClaudeModel(model.Claude, 'claude-3-opus-20240229'),
  CustomModel: newCustomModel(model.CustomModel)
})

export const msgDict: {
  [key in 'human' | 'system' | 'ai']: (
    c: MessageContent
  ) => HumanMessage | SystemMessage | AIMessage
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
