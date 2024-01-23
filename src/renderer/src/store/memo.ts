import { createMemo } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import { MemoModel } from 'src/main/models/model'
import { userData } from './user'

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
export function onCancelEditMemo(id: string) {
  if (id === 'creating') {
    setMemories(
      produce((m) => {
        m.shift()
      })
    )
  } else {
    setMemories(
      produce((m) => {
        m[id] = 'saved'
      })
    )
  }
}
export { memories, memoriesStatus }
