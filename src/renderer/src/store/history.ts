import { cloneDeep } from 'lodash'
import { createStore } from 'solid-js/store'
import { HistoryModel } from 'src/main/models/model'
import { ulid } from 'ulid'

const [histories, setHistories] = createStore<HistoryModel[]>([])

export async function loadHistories() {
  return window.api.getHistories().then(setHistories)
}

export async function starHistory(historyID: string, status: boolean) {
  await window.api.setHistoryStar(historyID, status)
  loadHistories()
  return
}

export async function clearHistory() {
  await window.api.clearHistory()
  loadHistories()
  return
}

export async function addHistory(history: HistoryModel) {
  await window.api.addHistory(cloneDeep(history))
  loadHistories()
}

export async function copyHistory(historyID: string) {
  const history = cloneDeep(histories.find((history) => history.id === historyID)!)
  const id = ulid()
  await window.api.addHistory({
    ...history,
    id,
    starred: false
  })
  loadHistories()
}

export async function removeHistory(historyID: string) {
  await window.api.deleteHistory(historyID)
  loadHistories()
}

export const chatHistoryTransfer: {
  now: HistoryModel
  init: () => void
  drawHistory(id: string): HistoryModel
  newHistory(history: {
    contents: HistoryModel['contents']
    assistantId?: HistoryModel['assistantId']
  }): string
} = {
  now: {
    id: '',
    type: 'chat',
    assistantId: '',
    starred: false,
    contents: []
  },
  init() {
    this.now = {
      id: '',
      type: 'chat',
      assistantId: '',
      starred: false,
      contents: []
    }
  },
  // 将历史提取出出来
  drawHistory(id) {
    this.now = cloneDeep(histories.find((history) => history.id === id)!)
    removeHistory(id)
    return this.now
  },
  newHistory(history) {
    this.now.id && removeHistory(this.now.id)
    const id = ulid()
    addHistory({
      ...history,
      id,
      type: 'chat',
      starred: this.now.starred
    })
    this.init()
    return id
  }
}

export { histories }
