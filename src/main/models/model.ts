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

export default interface MemoryFragment {
  type: 'md' | 'xlsx'
  name: string
  from?: string
}
export interface MemoModel {
  id: string
  version: number
  name: string
  introduce?: string
  fragment: MemoryFragment[]
}
export type CreateMemoModel = Omit<MemoModel, 'version'>
export interface SettingModel {
  isOnTop: boolean
  canMultiCopy: boolean
  quicklyWakeUpKeys: string
  sendWithCmdOrCtrl: boolean
  models: Models
}

export interface MemoResult {
  content: string
}
