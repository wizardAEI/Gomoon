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
    (content) => {
      setAnswerStore('answer', (ans) => ans + content)
    },
    () => {
      setGeneratingStatus(false)
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
