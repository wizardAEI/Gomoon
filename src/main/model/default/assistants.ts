import { AssistantModel } from '../model'
import { readFileSync } from 'fs'
import { getResourcesPath } from '../../lib'

export default function getDefaultAssistants(): AssistantModel[] {
  const a = readFileSync(getResourcesPath('assistants.json'), 'utf-8')

  const { assistants } = JSON.parse(a)
  return assistants
}
