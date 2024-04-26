import type { MessageContent } from 'langchain/schema'
// 由于是全局匹配，为防止index忘记重置，禁止导出
const regDict = {
  // e.g. <gomoon-file src="https://xxx" filename="xxx"> 文件信息 </gomoon-file>
  regForFile: /<gomoon-file (.*?)>(.*?)<\/gomoon-file>/gs,
  regForUrl: /<gomoon-url (.*?)>(.*?)<\/gomoon-url>/gs,
  // e.g. <gomoon-search><gomoon-question>谁是Mary</gomoon-question><gomoon-val>我会给你与谁是Mary这个问题有关的内容:xxx</gomoon-val></gomoon-search>
  regForSearch: /<gomoon-search>(.*?)<\/gomoon-search>/gs,
  // e.g. <gomoon-memo><gomoon-question>谁是Mary</gomoon-question><gomoon-val>我会给你与谁是Mary这个问题有关的内容:xxx</gomoon-val></gomoon-memo>
  regForMemo: /<gomoon-memo>(.*?)<\/gomoon-memo>/gs,
  regForQuestion: /<gomoon-question>(.*?)<\/gomoon-question>/gs,
  regForVal: /<gomoon-val>(.*?)<\/gomoon-val>/gs,
  regForImage: /<gomoon-image (.*?)>(.*?)<\/gomoon-image>/gs,
  regForDrawer: /<gomoon-drawer>(.*?)<\/gomoon-drawer>/gs // 预置提示词『依据上述信息回答问题：』
} as const

function resetReg() {
  for (const key in regDict) {
    regDict[key].lastIndex = 0
  }
}

export function parseString(str: string, isLastMsg = false) {
  const { regForQuestion, regForVal } = regDict
  resetReg()
  const matches: {
    type: keyof typeof regDict
    display?: string
    src?: string
    filename?: string
    value: string
    index: number
    endIndex: number
  }[] = []
  // 遍历正则表达式字典，查找所有匹配项
  Object.entries(regDict).forEach(([type, regex]) => {
    let match: RegExpExecArray | null
    if (type === 'regForQuestion' || type === 'regForVal') {
      return
    }
    while ((match = regex.exec(str)) !== null) {
      if (type === 'regForFile') {
        matches.push({
          type,
          src: match[1].match(/src="(.+?)"/)?.[1],
          filename: match[1].match(/filename="(.+?)"/)?.[1],
          value: match[2],
          index: match.index,
          endIndex: regex.lastIndex
        })
      }
      if (type === 'regForUrl') {
        matches.push({
          type,
          src: match[1].match(/src="(.+?)"/)?.[1],
          value: match[2],
          index: match.index,
          endIndex: regex.lastIndex
        })
      }
      if (type === 'regForSearch') {
        regForQuestion.lastIndex = 0
        regForVal.lastIndex = 0
        const primary = match[1].match(regForQuestion)?.[0]?.replace(regForQuestion, '$1') || ''
        const val = match[1].match(regForVal)?.[0]?.replace(regForVal, '$1') || ''
        isLastMsg
          ? matches.push({
              type,
              display: primary,
              value: val,
              index: match.index,
              endIndex: regex.lastIndex
            })
          : matches.push({
              type,
              display: primary,
              value: primary,
              index: match.index,
              endIndex: regex.lastIndex
            })
      }
      if (type === 'regForMemo') {
        regForQuestion.lastIndex = 0
        regForVal.lastIndex = 0
        const primary = match[1].match(regForQuestion)?.[0]?.replace(regForQuestion, '$1') || ''
        const val = match[1].match(regForVal)?.[0]?.replace(regForVal, '$1') || ''
        isLastMsg
          ? matches.push({
              type,
              display: primary,
              value: val,
              index: match.index,
              endIndex: regex.lastIndex
            })
          : matches.push({
              type,
              display: primary,
              value: primary,
              index: match.index,
              endIndex: regex.lastIndex
            })
      }
      if (type === 'regForImage') {
        matches.push({
          type,
          src: match[1].match(/src="(.+?)"/)?.[1],
          filename: match[1].match(/filename="(.+?)"/)?.[1],
          value: match[2],
          index: match.index,
          endIndex: regex.lastIndex
        })
      }
      if (type === 'regForDrawer') {
        matches.push({
          type,
          value: match[1],
          index: match.index,
          display: '',
          endIndex: regex.lastIndex
        })
      }
    }
  })
  // 对所有匹配项按在原始字符串中的位置进行排序
  matches.sort((a, b) => a.index - b.index)
  // 添加普通文本为类型 'text'
  const result: {
    type: keyof typeof regDict | 'text'
    src?: string
    filename?: string
    display?: string
    value: string
  }[] = []
  let lastIndex = 0
  matches.forEach((match) => {
    const { type, value, index, endIndex, src, filename, display } = match
    if (index > lastIndex) {
      // 添加前一个匹配项和当前匹配项之间的文本
      result.push({
        type: 'text',
        value: str.slice(lastIndex, index)
      })
    }
    result.push({
      type,
      src,
      filename,
      display,
      value
    })
    lastIndex = endIndex
  })
  // 检查并添加最后一个匹配项后的文本
  if (lastIndex < str.length) {
    result.push({
      type: 'text',
      value: str.slice(lastIndex)
    })
  }
  return result
}

export function extractMeta(str: string, isLastMsg = false): MessageContent {
  resetReg()
  const arr: {
    type: 'search' | 'memo'
    primary: string
    val: string
  }[] = []
  const {
    regForFile,
    regForUrl,
    regForSearch,
    regForMemo,
    regForQuestion,
    regForVal,
    regForDrawer,
    regForImage
  } = regDict
  // 处理字符串中的正则内容和普通字符串并按字符串顺序组成数组
  if (regForImage.test(str)) {
    return parseString(str, isLastMsg).map((res) => {
      if (res.type === 'regForImage') {
        return {
          type: 'image_url',
          image_url: {
            url: res.value
          }
        }
      } else {
        return {
          type: 'text',
          text: res.value
        }
      }
    })
  }

  str.match(regForSearch)?.forEach((match) => {
    match = match.replace(regForSearch, '$1')
    regForQuestion.lastIndex = 0
    regForVal.lastIndex = 0
    arr.push({
      type: 'search',
      primary: match.match(regForQuestion)?.[0]?.replace(regForQuestion, '$1') || '',
      val: match.match(regForVal)?.[0]?.replace(regForVal, '$1') || ''
    })
  })
  str.match(regForMemo)?.forEach((match) => {
    match = match.replace(regForMemo, '$1')
    regDict.regForQuestion.lastIndex = 0
    regDict.regForVal.lastIndex = 0
    arr.push({
      type: 'memo',
      primary: match.match(regForQuestion)?.[0]?.replace(regForQuestion, '$1') || '',
      val: match.match(regForVal)?.[0]?.replace(regForVal, '$1') || ''
    })
  })

  str = str
    .replace(regForDrawer, '$1')
    .replace(regForFile, '$2')
    .replace(regForUrl, '$2')
    .replace(regForSearch, '')
    .replace(regForMemo, '')

  str += isLastMsg
    ? arr.map((item) => item.val).join('\n')
    : arr.map((item) => item.primary).join('\n')

  return str
}

export type ContentDisplay =
  | {
      type: 'file'
      src: string
      filename: string
    }
  | {
      type: 'url'
      src: string
    }
  | {
      type: 'text'
      content: string
    }
  | {
      type: 'search'
      question: string
    }
  | {
      type: 'memo'
      question: string
    }
  | {
      type: 'image'
      src: string
      filename: string
      value: string
    }
export function parseDisplayArr(str: string): ContentDisplay[] {
  resetReg()
  const contents = parseString(str, true)
  return contents.map((c) => {
    if (c.type === 'text') {
      return {
        type: 'text',
        content: c.value
      }
    }
    if (c.type === 'regForDrawer') {
      return {
        type: 'text',
        content: c.display || ''
      }
    }
    if (c.type === 'regForFile') {
      return {
        type: 'file',
        src: c.src || '',
        filename: c.filename || ''
      }
    }
    if (c.type === 'regForUrl') {
      return {
        type: 'url',
        src: c.src || ''
      }
    }
    if (c.type === 'regForSearch') {
      return {
        type: 'search',
        question: c.display || ''
      }
    }
    if (c.type === 'regForMemo') {
      return {
        type: 'memo',
        question: c.display || ''
      }
    }
    if (c.type === 'regForImage') {
      return {
        type: 'image',
        src: c.src || '',
        filename: c.filename || '',
        value: c.value
      }
    }
    return {
      type: 'text',
      content: c.value
    }
  })
}
