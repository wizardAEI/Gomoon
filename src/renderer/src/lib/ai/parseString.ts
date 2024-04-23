import type { MessageContent } from 'langchain/schema'

// 由于是全局匹配，为防止index忘记重置，禁止导出
const regDict = {
  // e.g. <gomoon-file src="https://xxx" filename="xxx"> 文件信息 </gomoon-file>
  regForFile: /<gomoon-file (.*?)>(.*?)<\/gomoon-file>/gs,
  regForUrl: /<gomoon-url (.*?)>(.*?)<\/gomoon-url>/gs,
  // e.g. <gomoon-search><gomoon-question>谁是Mary</gomoon-question><gomoon-val>查询信息</gomoon-val></gomoon-search>
  regForSearch: /<gomoon-search>(.*?)<\/gomoon-search>/gs,
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
    resetReg()
    const matches: {
      type: keyof typeof regDict
      value: string // 第一个捕获组是问题或其他内容
      index: number
      endIndex: number
    }[] = []
    // 遍历正则表达式字典，查找所有匹配项
    Object.entries(regDict).forEach(([type, regex]) => {
      let match: RegExpExecArray | null
      while ((match = regex.exec(str)) !== null) {
        if (type === 'regForFile') {
          matches.push({
            type,
            value: match[2],
            index: match.index,
            endIndex: regex.lastIndex
          })
        }
        if (type === 'regForUrl') {
          matches.push({
            type,
            value: match[2],
            index: match.index,
            endIndex: regex.lastIndex
          })
        }
        if (type === 'regForSearch') {
          isLastMsg
            ? matches.push({
                type,
                value: match[1],
                index: match.index,
                endIndex: regex.lastIndex
              })
            : matches.push({
                type,
                value: ' ',
                index: match.index,
                endIndex: regex.lastIndex
              })
        }
        if (type === 'regForMemo') {
          isLastMsg
            ? matches.push({
                type,
                value: match[1],
                index: match.index,
                endIndex: regex.lastIndex
              })
            : matches.push({
                type,
                value: ' ',
                index: match.index,
                endIndex: regex.lastIndex
              })
        }
        if (type === 'regForQuestion') {
          matches.push({
            type,
            value: match[1],
            index: match.index,
            endIndex: regex.lastIndex
          })
        }
        if (type === 'regForVal') {
          matches.push({
            type,
            value: match[1],
            index: match.index,
            endIndex: regex.lastIndex
          })
        }
        if (type === 'regForImage') {
          matches.push({
            type,
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
            endIndex: regex.lastIndex
          })
        }
      }
    })
    // 对所有匹配项按在原始字符串中的位置进行排序
    matches.sort((a, b) => a.index - b.index)
    // 添加普通文本为类型 'text'
    const result: (
      | {
          type: 'text'
          text: string
        }
      | {
          type: 'image_url'
          image_url:
            | string
            | {
                url: string
                detail?: 'auto' | 'low' | 'high'
              }
        }
    )[] = []
    let lastIndex = 0
    matches.forEach((match) => {
      if (match.index > lastIndex) {
        // 添加前一个匹配项和当前匹配项之间的文本
        result.push({
          type: 'text',
          text: str.slice(lastIndex, match.index)
        })
      }
      if (match.type === 'regForImage') {
        result.push({
          type: 'image_url',
          image_url: {
            url: match.value
          }
        })
      } else {
        result.push({
          type: 'text',
          text: match.value
        })
      }
      lastIndex = match.endIndex
    })
    // 检查并添加最后一个匹配项后的文本
    if (lastIndex < str.length) {
      result.push({
        type: 'text',
        text: str.slice(lastIndex)
      })
    }
    return result
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
      val: string
    }
export function parseDisplayArr(str: string): ContentDisplay[] {
  resetReg()
  const {
    regForFile,
    regForUrl,
    regForSearch,
    regForMemo,
    regForQuestion,
    regForDrawer,
    regForImage
  } = regDict
  const arr: ContentDisplay[] = []
  str = str.replace(regForDrawer, '')
  str.match(regForFile)?.forEach((match) => {
    arr.push({
      type: 'file',
      src: match.match(/<gomoon-file .*?src="(.+?)".*?>/)?.[1] || '',
      filename: match.match(/<gomoon-file .*?filename="(.+?)".*?>/)?.[1] || ''
    })
  })
  str.match(regForUrl)?.forEach((match) => {
    arr.push({
      type: 'url',
      src: match.match(/<gomoon-url .*?src="(.+?)".*?>/)?.[1] || ''
    })
  })
  str.match(regForSearch)?.forEach((match) => {
    match = match.replace(regForSearch, '$1')
    regForQuestion.lastIndex = 0
    arr.push({
      type: 'search',
      question: match.match(regForQuestion)?.[0]?.replace(regForQuestion, '$1') || ''
    })
  })
  str.match(regForMemo)?.forEach((match) => {
    match = match.replace(regForMemo, '$1')
    regForQuestion.lastIndex = 0
    arr.push({
      type: 'memo',
      question: match.match(regForQuestion)?.[0]?.replace(regForQuestion, '$1') || ''
    })
  })
  str.match(regForImage)?.forEach((match) => {
    regForQuestion.lastIndex = 0
    arr.push({
      type: 'image',
      src: match.match(/<gomoon-image .*?src="(.+?)".*?>/)?.[1] || '',
      filename: match.match(/<gomoon-image .*?filename="(.+?)".*?>/)?.[1] || '',
      val: match.replace(regForImage, '$2')
    })
  })
  if (arr.length === 0) {
    return [
      {
        type: 'text',
        content: str
      }
    ]
  } else {
    return arr.concat({
      type: 'text',
      content: Object.keys(regDict).reduce((pre, cur) => {
        return pre.replace(regDict[cur], '')
      }, str)
    })
  }
}
