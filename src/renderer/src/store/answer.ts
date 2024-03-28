import { ansAssistant } from '@renderer/lib/ai/langchain'
import { createStore, produce } from 'solid-js/store'
import { ulid } from 'ulid'
import { ErrorDict } from '@renderer/lib/constant'
import { extractMeta } from '@renderer/lib/ai/parseString'

import { addHistory } from './history'
import { getCurrentAssistantForAnswer } from './assistants'
import { consumedToken, setConsumedTokenForAns } from './input'

let trash = {
  answer: '',
  question: '',
  consumedToken: 0
}
function initTrash() {
  trash = {
    answer: '',
    question: '',
    consumedToken: 0
  }
}

const [answerStore, setAnswerStore] = createStore({
  answer: '',
  question: ''
})
const [ansStatus, setAnsStatus] = createStore({
  isGenerating: false
})
let controller: AbortController
let ansID: string

export function setGeneratingStatus(status: boolean) {
  setAnsStatus(
    produce((ansStatus) => {
      ansStatus.isGenerating = status
    })
  )
}

export async function genAns(q: string) {
  controller = new AbortController()
  const initialContent = '......'
  setAnswerStore('answer', initialContent)
  setAnswerStore('question', q)
  setGeneratingStatus(true)
  const ID = ulid()
  ansID = ID
  let haveAnswer = false
  try {
    await ansAssistant({
      question: extractMeta(q, true),
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
      endCallback(res) {
        let consumedToken = res.llmOutput?.estimatedTokenUsage?.totalTokens ?? 0
        !consumedToken && (consumedToken = res.llmOutput?.tokenUsage?.totalTokens)
        !consumedToken && (consumedToken = 0)
        ID === ansID && setGeneratingStatus(false)
        setConsumedTokenForAns(consumedToken)
      },
      errorCallback(err) {
        if (ID !== ansID) return
        setAnswerStore('answer', (ans) => ans + ErrorDict(err as Error))
        setGeneratingStatus(false)
      },
      pauseSignal: controller.signal
    })
  } catch (err) {
    if (!ansStatus.isGenerating) return
    setAnswerStore('answer', (ans) => {
      return ans === initialContent ? ErrorDict(err as Error) : ans + ErrorDict(err as Error)
    })
    setGeneratingStatus(false)
  }
}
export async function stopGenAns() {
  controller?.abort()
  ansID = ''
  setGeneratingStatus(false)
  setConsumedTokenForAns(await window.api.getTokenNum(answerStore.question + answerStore.answer))
}
export function reGenAns() {
  setAnswerStore('answer', '')
  setGeneratingStatus(true)
  genAns(answerStore.question)
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
  trash = {
    answer: answerStore.answer,
    question: answerStore.question,
    consumedToken: consumedToken().ans
  }
  setConsumedTokenForAns(0)
  setAnswerStore('answer', '')
  setAnswerStore('question', '')
}

export function restoreAns() {
  if (!trash.consumedToken) {
    return
  }
  setAnswerStore('answer', trash.answer)
  setAnswerStore('question', trash.question)
  setConsumedTokenForAns(trash.consumedToken)
  initTrash()
}

export { answerStore, setAnswerStore, ansStatus }
