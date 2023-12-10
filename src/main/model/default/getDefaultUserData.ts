import { UserData } from '../model'
import { readFileSync } from 'fs'
import { getResourcesPath } from '../../lib'

export function getDefaultUserData(): UserData {
  const a = readFileSync(getResourcesPath('assistants.json'), 'utf-8')

  const { selectedAssistantForAns, selectedAssistantForChat } =
    JSON.parse(a).selectedAssistantForAns
  return {
    firstTime: true,
    selectedModel: 'GPT4',
    selectedAssistantForAns,
    selectedAssistantForChat
  }
}
