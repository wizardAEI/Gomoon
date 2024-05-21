import { cloneDeep } from 'lodash'
import { createStore } from 'solid-js/store'
import { HistoryModel } from 'src/main/models/model'

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

export async function removeHistory(historyID: string) {
  await window.api.deleteHistory(historyID)
  loadHistories()
}

export { histories }
