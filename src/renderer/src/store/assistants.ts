import { createStore, produce } from 'solid-js/store'
import { AssistantModel, CreateAssistantModel, UpdateAssistantModel } from 'src/main/model/model'
import { userData } from './user'
import { createMemo } from 'solid-js'
import { cloneDeep } from 'lodash'

const [assistants, setAssistants] = createStore<AssistantModel[]>([])

const [assistantsStatus, setAssistantsStatus] = createStore<{
  [key: string]: 'editing' | 'creating' | 'saved'
}>({})

export async function loadAssistants() {
  setAssistants(await window.api.getAssistants())
  setAssistantsStatus(assistants.reduce((a, b) => ({ ...a, [b.id]: 'saved' }), {}))
  setAssistantsStatus({
    ...assistantsStatus,
    creating: 'creating'
  })
}

export function createNewAssistant(type: 'chat' | 'ans') {
  if (assistants.findIndex((a) => a.id === 'creating') !== -1) return
  const newA: AssistantModel = {
    type,
    id: 'creating',
    name: '',
    version: 1,
    prompt: ''
  }
  setAssistants(
    produce((a) => {
      a.unshift(newA)
    })
  )
}

export function onEditAssistant(id: string) {
  if (id === 'creating') return
  setAssistantsStatus(
    produce((a) => {
      a[id] = 'editing'
    })
  )
}

export function onCancelEditAssistant(id: string) {
  if (id === 'creating') {
    setAssistants(
      produce((a) => {
        a.shift()
      })
    )
  } else {
    setAssistantsStatus(
      produce((a) => {
        a[id] = 'saved'
      })
    )
  }
}

export async function saveAssistant(a: AssistantModel) {
  if (a.id === 'creating') {
    await window.api.createAssistant(cloneDeep(a))
    setAssistants(
      produce((as) => {
        as.shift()
      })
    )
  } else {
    await window.api.updateAssistant(a)
  }
  loadAssistants()
}

export async function deleteAssistant(id: string) {
  await window.api.deleteAssistant(id)
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

export { assistants, assistantsStatus }
