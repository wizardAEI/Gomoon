import { UserData } from '../model'

export function getDefaultUserData(): UserData {
  return {
    firstTime: true,
    selectedModel: 'GPT4',
    selectedAssistantForAns: '01HH6S1MZBM62394TJ44AD1V5F',
    selectedAssistantForChat: '01HH78V29YC19VKKDVM6XZ0R9K'
  }
}
