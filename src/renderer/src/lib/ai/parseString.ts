const regDict = {
  // e.g. <gomoon-file src="https://xxx" filename="xxx"> 文件信息 </gomoon-file>
  regForFile: /<gomoon-file (.*?)>(.*?)<\/gomoon-file>/gs,
  regForUrl: /<gomoon-url (.*?)>(.*?)<\/gomoon-url>/gs,
  // e.g. <gomoon-search><gomoon-question>谁是Mary</gomoon-question><gomoon-val>查询信息</gomoon-val></gomoon-search>
  regForSearch: /<gomoon-search>(.*?)<\/gomoon-search>/gs,
  regForMemo: /<gomoon-memo>(.*?)<\/gomoon-memo>/gs,
  regForQuestion: /<gomoon-question>(.*?)<\/gomoon-question>/gs,
  regForVal: /<gomoon-val>(.*?)<\/gomoon-val>/gs,
  regForDrawer: /<gomoon-drawer>(.*?)<\/gomoon-drawer>/gs
}

function resetReg() {
  for (const key in regDict) {
    regDict[key].lastIndex = 0
  }
}

export function extractMeta(str: string, isLastMsg = false) {
  resetReg()
  const arr: {
    type: 'search' | 'memo'
    primary: string
    val: string
  }[] = []
  const { regForFile, regForUrl, regForSearch, regForMemo, regForQuestion, regForVal } = regDict
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
export function parseDisplayArr(str: string): ContentDisplay[] {
  resetReg()
  const { regForFile, regForUrl, regForSearch, regForMemo, regForQuestion, regForDrawer } = regDict
  const arr: ContentDisplay[] = []
  str = str.replace(regForDrawer, '')
  str.match(regForFile)?.forEach((match) => {
    arr.push({
      type: 'file',
      src: match.replace(/<gomoon-file .*?src="(.+?)".*?\/>$/, '$1'),
      filename: match.replace(/<gomoon-file .*?filename="(.+?)".*?\/>$/, '$1')
    })
  })
  str.match(regForUrl)?.forEach((match) => {
    arr.push({
      type: 'url',
      src: match.replace(/<gomoon-url .*?src="(.+?)".*?\/>$/, '$1')
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
