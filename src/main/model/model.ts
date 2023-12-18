export interface SettingModel {
  isOnTop: boolean
  canMultiCopy: boolean
  quicklyWakeUpKeys: string
  sendWithCmdOrCtrl: boolean
  models: {
    OpenAI: {
      apiKey: string
      baseURL: string
      temperature: number
    }
    BaiduWenxin: {
      apiKey: string
      secretKey: string
      temperature: number
    }
  }
}

export type ModelsType = 'ERNIE3' | 'ERNIE4' | 'GPT3' | 'GPT4'

export interface UserDataModel {
  firstTime: boolean
  selectedModel: ModelsType
  selectedAssistantForChat: string
  selectedAssistantForAns: string
  firstTimeFor: {
    modelSelect?: boolean
    assistantSelect?: boolean
  }
}

export type AssistantType = 'chat' | 'answer'
export type ToolEnum = 'memory' | 'file' | 'image' | 'voice' | 'video'
export type AssistantModel = (
  | {
      type: 'chat'
    }
  | {
      type: 'ans'
      preContent?: string
      postContent?: string
    }
) & {
  id: string
  version: number
  name: string
  introduce?: string
  prompt: string
  // 保留字段
  deleted?: boolean
  tools?: ToolEnum[]
}

export type UpdateAssistantModel = Omit<AssistantModel, 'version'>
export type CreateAssistantModel = Omit<AssistantModel, 'id' | 'version'>

export interface HistoryModel {
  id: string
  type: 'chat' | 'ans'
  assistantId?: string
  contents: { id?: string; role: 'human' | 'system' | 'ai' | 'ans' | 'question'; content: string }[]
}

export interface Line {
  content: string
  from: string
}
