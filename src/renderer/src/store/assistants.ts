import { createStore, produce } from 'solid-js/store'
import { AssistantModel } from 'src/main/models/model'
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

export async function useAssistant(id: string) {
  await window.api.useAssistant(id)
  await loadAssistants()
}

export const getCurrentAssistantForAnswer = createMemo<AssistantModel>(() => {
  return (
    assistants.find((a) => a.id === userData.selectedAssistantForAns) || {
      type: 'ans',
      id: 'default',
      name: '暂无助手',
      introduce: '',
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

export const exportAssistants = async () => {
  const json = JSON.stringify(assistants)
  await window.api.saveFile('assistants.json', json)
}

export const importAssistants = async (content: string) => {
  try {
    const importA = JSON.parse(content)
    if (!Array.isArray(importA)) return false
    importA.forEach(async (a: AssistantModel) => {
      if (
        typeof a.id === 'string' &&
        typeof a.name === 'string' &&
        typeof a.prompt === 'string' &&
        (a.type === 'ans' || a.type === 'chat') &&
        typeof a.version === 'number'
      ) {
        const curA = assistants.find((as) => as.id === a.id)
        if (curA && curA.version >= a.version) return
        await saveAssistant(a)
      } else {
        throw new Error('invalid assistant')
      }
    })
    return true
  } catch (e) {
    return false
  }
}

export { assistants, assistantsStatus }
