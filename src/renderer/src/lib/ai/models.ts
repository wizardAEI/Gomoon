import { Models } from '@renderer/store/setting'
import { ChatBaiduWenxin } from 'langchain/chat_models/baiduwenxin'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { event } from '../util'

export type ModelsType = 'ERNIEModal' | 'GPT3Modal' | 'GPT4Modal'

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

const updateERNIEModal = (config: { apiKey: string; secretKey: string; temperature: number }) =>
  new ChatBaiduWenxin({
    streaming: true,
    modelName: 'ERNIE-Bot',
    baiduApiKey: config.apiKey,
    baiduSecretKey: config.secretKey,
    temperature: config.temperature
  })

const updateGPT3Modal = (config: { apiKey: string; baseURL: string; temperature: number }) =>
  new ChatOpenAI({
    streaming: true,
    modelName: 'gpt-3.5-turbo-0613',
    openAIApiKey: config.apiKey,
    temperature: config.temperature,
    configuration: {
      baseURL: config.baseURL
    }
  })

const updateGPT4Modal = (config: { apiKey: string; baseURL: string; temperature: number }) =>
  new ChatOpenAI({
    streaming: true,
    modelName: 'gpt-4-1106-preview',
    openAIApiKey: config.apiKey,
    temperature: config.temperature,
    configuration: {
      baseURL: config.baseURL
    }
  })

const updateModels = (model: Models) => ({
  ERNIEModal: updateERNIEModal(model.BaiduWenxin),
  GPT3Modal: updateGPT3Modal(model.OpenAI),
  GPT4Modal: updateGPT4Modal(model.OpenAI)
})

export const models = {
  ...updateModels(defaultModels())
}

event.on('updateModels', (model) => {
  Object.keys(models).forEach((key: string) => {
    models[key] = updateModels(model)[key]
  })
})
