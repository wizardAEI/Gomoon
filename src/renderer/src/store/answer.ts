import { ansAssistant } from '@renderer/lib/ai/langchain'
import { createStore, produce } from 'solid-js/store'
import { ulid } from 'ulid'

const [answerStore, setAnswerStore] = createStore({
  answer: '',
  question: ''
})
let controller: AbortController
let ansID: string
export function genAns(q: string) {
  controller = new AbortController()
  setAnswerStore('answer', '')
  setAnswerStore('question', q)
  setGeneratingStatus(true)
  const ID = ulid()
  ansID = ID
  ansAssistant(
    {
      text: q
    },
    {
      newTokenCallback(content) {
        ID === ansID && setAnswerStore('answer', (ans) => ans + content)
      },
      endCallback() {
        ID === ansID && setGeneratingStatus(false)
      },
      errorCallback(err) {
        if (ID !== ansID) return
        if ((err = 'Request timed out.')) {
          setAnswerStore('answer', (ans) => ans + '\n\n回答超时，请重试')
        } else {
          setAnswerStore('answer', (ans) => ans + `\n\n出问题了: ${err}`)
        }
        setGeneratingStatus(false)
      },
      pauseSignal: controller.signal
    }
  )
}
export function stopGenAns() {
  controller.abort()
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

export { answerStore, setAnswerStore, ansStatus }
