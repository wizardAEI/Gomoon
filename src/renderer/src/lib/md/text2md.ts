import { msgs } from '@renderer/store/msgs'
import moment from 'moment'

const roleDict = {
  ai: '助手',
  human: '我',
  system: '设定'
}

export default function (type: 'chat' | 'ans') {
  if (type === 'chat') {
    const content = msgs.reduce((c, msg) => {
      return c + '# ' + roleDict[msg.role] + '\n' + msg.content + '\n\n'
    }, '')
    window.api.saveFile(`聊天记录${moment().format('M-D-H-m-s')}.md`, content)
  }
}
