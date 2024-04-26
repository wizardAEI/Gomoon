import { answerStore } from '@renderer/store/answer'
import { msgs } from '@renderer/store/chat'
import MarkdownIt from 'markdown-it'
import { full as emoji } from 'markdown-it-emoji'
import mdHighlight from 'markdown-it-highlightjs'
import katex from '@vscode/markdown-it-katex'
import html2canvas from 'html2canvas'
import moment from 'moment'

import { parseDisplayArr } from '../ai/parseString'
const roleDict = {
  ai: '助手',
  human: '我',
  system: '设定'
}

export default async function (
  type: 'chat' | 'ans',
  format: 'md' | 'png'
): Promise<{
  suc: boolean
  result: string
}> {
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
  let data: string = ''
  console.log(content)
  const arr = parseDisplayArr(content)
  console.log(arr)
  data = arr.reduce((c, item) => {
    c += '\n'
    if (item.type === 'text') {
      c += item.content
    }
    if (item.type === 'image') {
      return c + `<img alt="${item.filename}" src="${item.val}"/>`
    }
    return c
  }, '')
  console.log(data)
  if (format === 'md') {
    data = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
  } else {
    const md = MarkdownIt({
      linkify: true,
      breaks: true
    })
      .use(mdHighlight)
      .use(katex)
      .use(emoji)
    const html = md.render(content)
    const dom = document.createElement('div')
    document.body.append(dom)
    dom.style.fontFamily = 'Microsoft YaHei'
    dom.style.height = '100px'
    dom.style.overflow = 'scroll'
    dom.style.position = 'relative'
    dom.style.zIndex = '-1'
    dom.innerHTML = `<div class="markdown break-words text-sm bg-dark px-3 py-2 overflow-x-visible absolute">${html}</div>`
    const canvas = await html2canvas(dom.children[0] as HTMLDivElement)
    dom.remove()
    data = canvas.toDataURL()
  }
  const a = document.createElement('a')
  a.href = data
  a.download = `对话记录${moment().format('D-H-m')}.${format}` // 设置下载的文件名
  a.click() // 触发点击事件下载图片
  a.remove()
  return { suc: true, result: '' }
}
