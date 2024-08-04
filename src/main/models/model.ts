import { Models, ModelsType } from '../../lib/langchain'

export interface UserDataModel {
  firstTime: boolean
  selectedModel: ModelsType
  selectedAssistantForChat: string
  selectedAssistantForAns: string
  selectedMemo: string
  firstTimeFor: {
    modelSelect?: boolean
    assistantSelect?: boolean
  }
  windowSize: {
    width: number
    height: number
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
      prompts?: string[]
    }
) & {
  id: string
  version: number
  name: string
  introduce?: string
  prompt: string
  matchModel?: ModelsType | 'current'
  // 保留字段
  deleted?: boolean
  tools?: ToolEnum[]
}
export type CreateAssistantModel = Omit<AssistantModel, 'id' | 'version'> & { version?: number }
export interface HistoryModel {
  id: string
  type: 'chat' | 'ans'
  assistantId?: string
  starred?: boolean
  contents: { id?: string; role: 'human' | 'system' | 'ai' | 'ans' | 'question'; content: string }[]
}
export interface CollectionModel {
  id: string
  name: string
  contents: {
    id?: string
    type: 'chat' | 'ans'
    assistantId: string
    role: 'human' | 'system' | 'ai' | 'ans' | 'question'
    content: string
  }[][]
}
export type CreateCollectionModel = Omit<CollectionModel, 'id'>

export interface Line {
  content: string
  from: string
}
export interface MemoFragment {
  type: 'md' | 'xlsx'
  name: string
  from?: string
}
export interface MemoFragmentData {
  id: string
  name: string
  data: string
  embeddingModel: string
  vectors: Float32Array[]
  indexes: string[]
}
export interface MemoModel {
  id: string
  version: number
  name: string
  introduce?: string
  fragment: MemoFragment[]
}
export type CreateMemoModel = Omit<MemoModel, 'version'> & { version?: number }

export type SettingFontFamily = 'default' | 'MiSans' | 'AlimamaFangyuan'
export interface SettingModel {
  isOnTop: boolean
  canMultiCopy: boolean
  quicklyWakeUpKeys: string
  sendWithCmdOrCtrl: boolean
  models: Models
  theme: string
  chatFontSize: number
  fontFamily: SettingFontFamily
  openAtLogin: boolean
}
export interface MemoResult {
  content: string
}
