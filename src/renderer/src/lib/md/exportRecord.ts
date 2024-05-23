import { answerStore } from '@renderer/store/answer'
import { msgs } from '@renderer/store/chat'
import MarkdownIt from 'markdown-it'
import { full as emoji } from 'markdown-it-emoji'
import mdHighlight from 'markdown-it-highlightjs'
import katex from '@vscode/markdown-it-katex'
import moment from 'moment'

import { parseString } from '../ai/parseString'
import html2canvas from '../html2canvas'

const roleDict = {
  ai: '助手',
  human: '提问',
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
  const title = (t: string) =>
    `<div style="padding:16px 0px 8px 0px"><span style="border:2px solid #869d9d; padding:3px 6px; border-radius:8px; font-size: 14px;">${t}</span></div>`
  if (type === 'chat') {
    if (msgs.length === 0) return { suc: false, result: '无无对话记录' }
    content = msgs.reduce((c, msg) => {
      return c + title(roleDict[msg.role]) + '\n' + msg.content + '\n\n'
    }, '')
  }
  if (type === 'ans') {
    if (answerStore.question === '' && answerStore.answer === '')
      return { suc: false, result: '无无对话记录' }
    content =
      title('问题') + '\n' + answerStore.question + `\n ${title('回答')}\n` + answerStore.answer
  }
  let data: string = ''
  data = parseString(content).reduce((c, item) => {
    c += '\n'
    if (item.type === 'text') {
      return c + item.value
    }
    if (item.type === 'regForFile') {
      return (
        c +
        item.value.split('\n').reduce((p, c) => {
          return p + '\n> ' + c
        }, '')
      )
    }
    if (item.type === 'regForSearch') {
      return c + '联网查询：' + item.display
    }
    if (item.type === 'regForMemo') {
      return c + '查询记忆胶囊：' + item.display
    }
    if (item.type === 'regForUrl') {
      return c + `[${item.src}](${item.src})`
    }
    if (item.type === 'regForImage') {
      return c + `<img alt="${item.filename}" src="${item.value}" class="max-w-[100%]"/>`
    }
    return c
  }, '')
  if (format === 'md') {
    data =
      'data:text/plain;charset=utf-8,' +
      encodeURIComponent(`> From [Gomoon](https://gomoon.top)\n${data}`)
  } else {
    const md = MarkdownIt({
      linkify: true,
      breaks: true,
      html: true
    })
      .use(mdHighlight)
      .use(katex)
      .use(emoji)
    const html = md.render(data)
    const dom = document.createElement('div')
    document.body.append(dom)
    dom.style.height = '100px'
    dom.style.overflow = 'scroll'
    dom.style.position = 'relative'
    dom.style.zIndex = '-1'

    dom.innerHTML = `<div class="markdown break-words text-sm bg-dark px-6 pt-4 py-8 overflow-x-visible">
    ${html}
    </div>`

    const canvas = await html2canvas(dom.children[0] as HTMLDivElement, {
      backgroundColor: '#00000000'
    })

    const canvasF = document.createElement('canvas')
    const ctx = canvasF.getContext('2d')!
    canvasF.width = canvas.width + 128
    canvasF.height = canvas.height + 208
    ctx.font = 'italic lighter 30px serif '
    ctx.fillStyle = '#869d9d'
    ctx.fillText('From Gomoon --- gomoon.top', canvas.width - 280, canvas.height + 140)
    ctx.shadowOffsetX = 10
    ctx.shadowOffsetY = 35
    ctx.shadowBlur = 50
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
    ctx.drawImage(canvas, 64, 64)

    dom.remove()

    await new Promise((res, reject) => {
      canvasF.toBlob((blob) => {
        try {
          if (blob) {
            const clipboard = navigator.clipboard
            if (clipboard) {
              clipboard.write([new ClipboardItem({ [blob.type]: blob })])
            }
            res(null)
          }
        } catch (e) {
          reject(`图片复制失败: ${(e as Error).message}`)
        }
      })
    })
    return { suc: true, result: '已复制到剪切板' }
  }
  const a = document.createElement('a')
  a.href = data
  a.download = `对话记录${moment().format('D-H-m')}.${format}` // 设置下载的文件名
  a.click() // 触发点击事件下载图片
  a.remove()
  return { suc: true, result: '已保存至本地' }
}
