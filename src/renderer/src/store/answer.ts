import { translator } from '@renderer/lib/langchain'
import { createStore, produce } from 'solid-js/store'

const [answerStore, setAnswerStore] = createStore({
  answer: '',
  question: ''
})

export function genAns(q: string) {
  setAnswerStore('answer', '')
  setAnswerStore('question', q)
  setGeneratingStatus(true)
  translator(
    {
      text: q
    },
    {
      newTokenCallback(content) {
        setAnswerStore('answer', (ans) => ans + content)
      },
      endCallback() {
        setGeneratingStatus(false)
      },
      errorCallback(err) {
        if ((err = 'Request timed out.')) {
          setAnswerStore('answer', (ans) => ans + '\n\n回答超时，请重试')
        } else {
          setAnswerStore('answer', (ans) => ans + `\n\n出问题了: ${err}`)
        }
        setGeneratingStatus(false)
      }
    }
  )
}

export function reGenAns() {
  setAnswerStore('answer', '')
  setGeneratingStatus(true)
  translator(
    {
      text: answerStore.question
    },
    {
      newTokenCallback(content) {
        setAnswerStore('answer', (ans) => ans + content)
      },
      endCallback() {
        setGeneratingStatus(false)
      },
      errorCallback(err) {
        if ((err = 'Request timed out.')) {
          setAnswerStore('answer', (ans) => ans + '\n\n回答超时，请重试')
        } else {
          setAnswerStore('answer', (ans) => ans + `\n\n出问题了: ${err}`)
        }
        setGeneratingStatus(false)
      }
    }
  )
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
