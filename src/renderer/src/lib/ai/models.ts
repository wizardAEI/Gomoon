import { Models } from '@renderer/store/setting'
import { ChatBaiduWenxin } from 'langchain/chat_models/baiduwenxin'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { event } from '../util'
import { ModelsType } from 'src/main/model/model'

export const defaultModels = () =>
  new Object({
    OpenAI: {
      apiKey: 'api-key',
      baseURL: '',
      temperature: 0.7
    },
    BaiduWenxin: {
      apiKey: 'api-key',
      secretKey: 'secret-key',
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
    baiduApiKey: config.apiKey,
    baiduSecretKey: config.secretKey,
    temperature: config.temperature
  })

const newGPTModal = (
  config: { apiKey: string; baseURL: string; temperature: number },
  modelName: string
) =>
  new ChatOpenAI({
    streaming: true,
    modelName,
    openAIApiKey: config.apiKey,
    temperature: config.temperature,
    configuration: {
      baseURL: config.baseURL
    }
  })

const updateModels = (
  model: Models
): {
  [key in ModelsType]: ChatBaiduWenxin | ChatOpenAI
} => ({
  ERNIE3: newERNIEModal(model.BaiduWenxin, 'ERNIE-Bot'),
  ERNIE4: newERNIEModal(model.BaiduWenxin, 'ERNIE-Bot-4'),
  GPT3: newGPTModal(model.OpenAI, 'gpt-3.5-turbo-0613'),
  GPT4: newGPTModal(model.OpenAI, 'gpt-4-1106-preview')
})

export const models = {
  ...updateModels(defaultModels())
}

event.on('updateModels', (model) => {
  Object.keys(models).forEach((key: string) => {
    models[key] = updateModels(model)[key]
  })
})
