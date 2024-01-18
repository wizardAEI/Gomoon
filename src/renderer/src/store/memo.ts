import { createMemo } from 'solid-js'
import { createStore } from 'solid-js/store'
import { MemoModel } from 'src/main/models/model'
import { userData } from './user'

const [memories, setMemories] = createStore<MemoModel[]>([])
const [memoriesStatus, setMemoriesStatus] = createStore<{
  [key: string]: 'editing' | 'creating' | 'saved'
}>({})
export async function loadMemories() {
  console.log(await window.api.getMemories())
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
