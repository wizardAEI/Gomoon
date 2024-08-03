import { cloneDeep } from 'lodash'
import { createStore } from 'solid-js/store'
import { HistoryModel } from 'src/main/models/model'
import { ulid } from 'ulid'

import { answerStore, setAnswerStore } from './answer'
import { Msg, msgMeta, msgs, setMsgMeta, setMsgs } from './chat'
import { setSelectedAssistantForAns, setSelectedAssistantForChat } from './user'
import { getCurrentAssistantForAnswer, getCurrentAssistantForChat } from './assistants'

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

export const historyManager: {
  formatHistory(type: 'chat' | 'ans'): HistoryModel
  drawHistory(history: HistoryModel)
  newHistory(type: 'chat' | 'ans'): Promise<void>
} = {
  formatHistory(type: 'chat' | 'ans') {
    if (type === 'ans') {
      return {
        id: answerStore.id,
        type: 'ans',
        assistantId: getCurrentAssistantForAnswer()?.id,
        contents: [
          {
            role: 'question',
            content: answerStore.question
          },
          {
            role: 'ans',
            content: answerStore.answer
          }
        ]
      }
    } else {
      return {
        id: msgMeta.id,
        type: 'chat',
        assistantId: getCurrentAssistantForChat()?.id,
        contents: cloneDeep(msgs)
      }
    }
  },
  async drawHistory(h: HistoryModel) {
    if (h.type === 'ans') {
      if (answerStore.answer && answerStore.question) {
        await this.newHistory('ans')
      }
      setAnswerStore('id', h.id)
      setAnswerStore('question', h.contents[0].content)
      setAnswerStore('answer', h.contents[1].content)
      h.assistantId && setSelectedAssistantForAns(h.assistantId)
    } else if (h.type === 'chat') {
      msgs.length && (await this.newHistory('chat'))
      setMsgMeta('id', h.id)
      setMsgs(h.contents as Msg[])
      h.assistantId && setSelectedAssistantForChat(h.assistantId)
    }
  },
  async newHistory(type: 'chat' | 'ans') {
    const history = this.formatHistory(type)
    let starred = false
    const oldH = histories.find((h) => h.id === history.id)
    if (oldH) {
      starred = !!oldH.starred
      await removeHistory(history.id)
    }
    addHistory({
      starred,
      ...history
    })
  }
}

export { histories }
