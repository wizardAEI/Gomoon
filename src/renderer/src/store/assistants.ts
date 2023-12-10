import { createStore, produce } from 'solid-js/store'
import { AssistantModel, CreateAssistantModel, UpdateAssistantModel } from 'src/main/model/model'
import { userData } from './user'
import { createMemo } from 'solid-js'

const [assistants, setAssistants] = createStore<AssistantModel[]>([])

export async function loadAssistants() {
  setAssistants(await window.api.getAssistants())
}

export async function createAssistant(a: CreateAssistantModel) {
  const newA = await window.api.createAssistant(a)
  setAssistants(
    produce((a) => {
      a.push(newA)
    })
  )
}

export async function deleteAssistant(id: string) {
  await window.api.deleteAssistant(id)
  loadAssistants()
}

export async function updateAssistant(a: UpdateAssistantModel) {
  await window.api.updateAssistant(a)
  loadAssistants()
}

export const getCurrentAssistantForAnswer = createMemo<AssistantModel>(() => {
  return (
    assistants.find((a) => a.id === userData.selectedAssistantForAns) || {
      type: 'ans',
      id: 'default',
      name: '暂无助手',
      prompt: '',
      version: 0
    }
  )
})

export const getCurrentAssistantForChat = createMemo<AssistantModel>(
  () =>
    assistants.find((a) => a.id === userData.selectedAssistantForChat) || {
      type: 'chat',
      id: 'default',
      name: '暂无助手',
      prompt: '',
      version: 0
    }
)

export { assistants }
