import { readFileSync } from 'fs'
import { getResourcesPath } from '../lib'
import { AssistantModel, Line, MemoModel, UserDataModel } from './model'
import { SettingModel } from "../../lib/langchain"

export function getDefaultAssistants(): AssistantModel[] {
  const a = readFileSync(getResourcesPath('assistants.json'), 'utf-8')
  const { assistants } = JSON.parse(a)
  return assistants
}

export function getDefaultConfig(): SettingModel {
  return {
    isOnTop: false,
    models: {
      OpenAI: {
        apiKey: '',
        baseURL: '',
        temperature: 0.7
      },
      BaiduWenxin: {
        apiKey: '',
        secretKey: '',
        temperature: 0.7
      },
      AliQWen: {
        apiKey: '',
        temperature: 0.7
      }
    },
    canMultiCopy: true,
    quicklyWakeUpKeys: 'CmdOrCtrl+G',
    sendWithCmdOrCtrl: true
  }
}

export function getDefaultLines(): Line[] {
  const lines = readFileSync(getResourcesPath('lines.json'), 'utf-8')
  const ls = JSON.parse(lines)
  return ls
}

export function getDefaultUserData(): UserDataModel {
  const a = readFileSync(getResourcesPath('assistants.json'), 'utf-8')
  const memo = readFileSync(getResourcesPath('memories.json'), 'utf-8')

  const { selectedAssistantForAns, selectedAssistantForChat } = JSON.parse(a)
  const { selectedMemo } = JSON.parse(memo)
  return {
    firstTime: true,
    selectedModel: 'GPT4',
    selectedAssistantForAns,
    selectedAssistantForChat,
    selectedMemo,
    firstTimeFor: {
      modelSelect: true,
      assistantSelect: true
    }
  }
}

export function getDefaultMemories(): MemoModel[] {
  const memo = readFileSync(getResourcesPath('memories.json'), 'utf-8')
  const { memories } = JSON.parse(memo)
  return memories
}
