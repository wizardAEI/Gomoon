import { UserDataModel } from '../model'
import { readFileSync } from 'fs'
import { getResourcesPath } from '../../lib'

export function getDefaultUserData(): UserDataModel {
  const a = readFileSync(getResourcesPath('assistants.json'), 'utf-8')

  const { selectedAssistantForAns, selectedAssistantForChat } = JSON.parse(a)
  return {
    firstTime: true,
    selectedModel: 'GPT4',
    selectedAssistantForAns,
    selectedAssistantForChat,
    firstTimeFor: {
      modelSelect: true,
      assistantSelect: true
    }
  }
}
