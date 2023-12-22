import { ansAssistant } from '@renderer/lib/ai/langchain'
import { createStore, produce } from 'solid-js/store'
import { ulid } from 'ulid'
import { addHistory } from './history'
import { ErrorDict } from '@renderer/lib/constant'
import { getCurrentAssistantForAnswer } from './assistants'
import { removeMeta } from '@renderer/lib/ai/parseString'

const [answerStore, setAnswerStore] = createStore({
  answer: '',
  question: ''
})
let controller: AbortController
let ansID: string
export function genAns(q: string) {
  controller = new AbortController()
  setAnswerStore('answer', '......')
  setAnswerStore('question', q)
  setGeneratingStatus(true)
  const ID = ulid()
  ansID = ID
  let haveAnswer = false
  ansAssistant({
    question: removeMeta(q),
    newTokenCallback(content) {
      ID === ansID &&
        setAnswerStore('answer', (ans) => {
          if (!haveAnswer) {
            haveAnswer = true
            return content
          }
          return ans + content
        })
    },
    endCallback() {
      ID === ansID && setGeneratingStatus(false)
    },
    errorCallback(err) {
      if (ID !== ansID) return
      setAnswerStore('answer', (ans) => ans + ErrorDict(err))
      setGeneratingStatus(false)
    },
    pauseSignal: controller.signal
  })
}
export function stopGenAns() {
  controller?.abort()
  ansID = ''
  setGeneratingStatus(false)
}
export function reGenAns() {
  setAnswerStore('answer', '')
  setGeneratingStatus(true)
  genAns(answerStore.question)
}

const [ansStatus, setAnsStatus] = createStore({
  isGenerating: false
})

export function setGeneratingStatus(status: boolean) {
  setAnsStatus(
    produce((ansStatus) => {
      ansStatus.isGenerating = status
    })
  )
}

export async function saveAns() {
  return addHistory({
    id: ulid(),
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
  })
}

export function clearAns() {
  stopGenAns()
  setAnswerStore('answer', '')
  setAnswerStore('question', '')
}

export { answerStore, setAnswerStore, ansStatus }
