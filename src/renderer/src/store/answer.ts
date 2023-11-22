import { translator } from '@renderer/lib/langchain'
import { createStore } from 'solid-js/store'

const [answerStore, setAnswerStore] = createStore({
  answer: '',
  question: ''
})

export function genAns(q: string) {
  setAnswerStore('answer', '')
  setAnswerStore('question', q)
  translator(
    {
      text: q
    },
    (content) => {
      setAnswerStore('answer', (ans) => ans + content)
    }
  )
}

export { answerStore, setAnswerStore }
