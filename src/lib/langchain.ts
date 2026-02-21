import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import type { MessageContent } from '@langchain/core/messages'

import type { ModelsConfig, Provider, EnabledModel } from './models-config'

export type { ModelsConfig, Provider, EnabledModel }

/** 兼容旧代码的 ModelsType - 现为 EnabledModel.id */
export type ModelsType = string

/** 获取模型展示信息 */
export function getModelInfo(modelId: string, enabledModels: EnabledModel[]) {
  const em = enabledModels.find((m) => m.id === modelId)
  if (em) {
    return {
      label: em.label || em.modelId,
      maxToken: em.maxToken ?? 128000
    }
  }
  return { label: modelId, maxToken: 128000 }
}

export const defaultModels = (): ModelsConfig => ({
  providers: [],
  enabledModels: []
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
