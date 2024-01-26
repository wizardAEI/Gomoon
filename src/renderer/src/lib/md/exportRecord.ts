import { answerStore } from '@renderer/store/answer'
import { msgs } from '@renderer/store/chat'
import moment from 'moment'

const roleDict = {
  ai: '助手',
  human: '我',
  system: '设定'
}

export default function (type: 'chat' | 'ans'): {
  suc: boolean
  result: string
} {
  let content = ''
  if (type === 'chat') {
    content = msgs.reduce((c, msg) => {
      return c + '# ' + roleDict[msg.role] + '\n' + msg.content + '\n\n'
    }, '')
  }
  if (type === 'ans') {
    if (answerStore.question === '' && answerStore.answer === '')
      return { suc: false, result: 'NoRecord' }
    content = '# 问题\n' + answerStore.question + '\n\n# 回答\n' + answerStore.answer
  }
  if (content === '') return { suc: false, result: 'NoRecord' }
  window.api.saveFile(`对话记录${moment().format('M-D-H-m-s')}.md`, content)
  return { suc: true, result: '' }
}
