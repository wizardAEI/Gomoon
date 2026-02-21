/** Provider 提供商（统一 OpenAI 格式） */
export interface Provider {
  id: string
  name: string
  apiKey: string
  baseURL: string
}

/** 已启用模型（用户从 /models 列表中添加） */
export interface EnabledModel {
  id: string
  providerId: string
  modelId: string
  label?: string
  temperature: number
  maxToken?: number
}

export interface ModelsConfig {
  providers: Provider[]
  enabledModels: EnabledModel[]
}
