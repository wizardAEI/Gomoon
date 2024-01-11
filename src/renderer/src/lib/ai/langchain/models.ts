import { Models } from '@renderer/store/setting'
import { ChatBaiduWenxin } from '@langchain/community/chat_models/baiduwenxin'
import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi'
import { ChatOpenAI } from '@langchain/openai'

import { event } from '../../util'
import { ModelsType } from 'src/main/models/model'

export type ModelInterfaceType = ChatBaiduWenxin | ChatOpenAI | ChatAlibabaTongyi

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

const newERNIEModal = (
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

const newGPTModal = (
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

const newQWenModel = (
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

const updateModels = (
  model: Models
): {
  [key in ModelsType]: ModelInterfaceType
} => ({
  ERNIE3: newERNIEModal(model.BaiduWenxin, 'ERNIE-Bot-turbo'),
  ERNIE4: newERNIEModal(model.BaiduWenxin, 'ERNIE-Bot-4'),
  GPT3: newGPTModal(model.OpenAI, 'gpt-3.5-turbo-1106'),
  GPT4: newGPTModal(model.OpenAI, 'gpt-4-1106-preview'),
  QWenTurbo: newQWenModel(model.AliQWen, 'qwen-turbo'),
  QWenPlus: newQWenModel(model.AliQWen, 'qwen-plus'),
  QWenMax: newQWenModel(model.AliQWen, 'qwen-max')
})

export const models = {
  ...updateModels(defaultModels())
}

event.on('updateModels', (model) => {
  Object.keys(models).forEach((key: string) => {
    models[key] = updateModels(model)[key]
  })
})
