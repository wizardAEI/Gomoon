import { readFileSync } from 'fs'
import { getResourcesPath } from '../lib'
import { AssistantModel, Line, MemoModel, UserDataModel } from './model'
import { SettingModel } from './model'
import { ImportMemoDataModel } from './memo'

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
        temperature: 0.7,
        customModel: ''
      },
      BaiduWenxin: {
        apiKey: '',
        secretKey: '',
        temperature: 0.5
      },
      AliQWen: {
        apiKey: '',
        temperature: 0.7
      },
      Gemini: {
        apiKey: '',
        temperature: 0.7
      },
      Llama: {
        src: '',
        temperature: 0.7
      },
      Moonshot: {
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

export function getDefaultMemories(): {
  memo: MemoModel
  data: {
    [id: string]: ImportMemoDataModel
  }
}[] {
  const memo = readFileSync(getResourcesPath('memories.json'), 'utf-8')
  const { memories } = JSON.parse(memo)
  return memories
}
