import { createMemo } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import { MemoModel } from 'src/main/models/model'
import { userData } from './user'
import { cloneDeep } from 'lodash'
import { SaveMemoParams } from 'src/main/lib/ai/embedding'

const [memories, setMemories] = createStore<MemoModel[]>([])
const [memoriesStatus, setMemoriesStatus] = createStore<{
  [key: string]: 'editing' | 'creating' | 'saved'
}>({})
export async function loadMemories() {
  setMemories(await window.api.getMemories())
  setMemoriesStatus(memories.reduce((a, b) => ({ ...a, [b.id]: 'saved' }), {}))
  setMemoriesStatus({
    ...memoriesStatus,
    creating: 'creating'
  })
}
export async function initMemories() {
  await window.api.initMemories()
  await loadMemories()
}
export const getCurrentMemo = createMemo<MemoModel>(() => {
  return (
    memories.find((a) => a.id === userData.selectedMemo) || {
      id: 'default',
      name: '暂无记忆',
      version: 0,
      introduce: '',
      fragment: []
    }
  )
})

export function createNewMemo() {
  if (memories.findIndex((m) => m.id === 'creating') !== -1) return
  const newM: MemoModel = {
    id: 'creating',
    name: '',
    version: 1,
    introduce: '',
    fragment: []
  }
  setMemories(
    produce((a) => {
      a.unshift(newM)
    })
  )
}
export async function onEditMemo(id: string) {
  await window.api.editMemory(id, cloneDeep(memories.find((m) => m.id === id)?.fragment) || [])
  setMemoriesStatus(
    produce((m) => {
      m[id] = 'editing'
    })
  )
}
export function onCancelEditMemo(id: string) {
  window.api.cancelSaveMemory(id)
  if (id === 'creating') {
    setMemories(
      produce((m) => {
        m.shift()
      })
    )
  } else {
    setMemoriesStatus(
      produce((m) => {
        m[id] = 'saved'
      })
    )
  }
}
export async function saveMemo(m: SaveMemoParams) {
  await window.api.saveMemory(cloneDeep(m))
  setMemories(
    produce((memo) => {
      memo.shift()
    })
  )
  loadMemories()
}
export async function useMemo(id: string) {
  await window.api.useMemory(id)
  await loadMemories()
}
export async function deleteMemo(id: string) {
  await window.api.deleteMemory(id)
  loadMemories()
}
export async function importMemo(path: string) {
  if (!(await window.api.importMemory(path))) {
    return false
  }
  loadMemories()
  return true
}
export { memories, memoriesStatus }
