import { MemoResult } from 'src/main/models/model'

export function processMemo(question: string, memories: MemoResult[]) {
  return `<gomoon-memo><gomoon-question>${question}</gomoon-question><gomoon-val>${question}
  这是一些可能和上述问题有关的参考信息：${memories
    .map((m) => m.content)
    .join('')}</gomoon-val></gomoon-memo>`
}
