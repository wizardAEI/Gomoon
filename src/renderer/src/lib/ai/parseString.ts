const regForFile = /^<gomoon-file .*?\/>/g,
  regForUrl = /^<gomoon-url .*?\/>/g

function resetReg() {
  ;(regForFile.lastIndex = 0), (regForUrl.lastIndex = 0) // 重置正则
}

export function removeMeta(str: string) {
  // 剔除 <gomoon-file ... /> <gomoon-url ... /> 等
  const newStr = str.replace(regForFile, '').replace(regForUrl, '')
  resetReg()
  return newStr
}

export type ContentMetaData =
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
    }

export function parseMeta(str: string): ContentMetaData {
  // 解析 <gomoon-file ... /> <gomoon-url ... /> 等
  if (str.match(regForFile)) {
    return {
      type: 'file',
      src: str.match(regForFile)![0].replace(/^<gomoon-file .*?src="(.+?)".*?\/>$/, '$1'),
      filename: str.match(regForFile)![0].replace(/^<gomoon-file .*?filename="(.+?)".*?\/>$/, '$1')
    }
  }
  if (str.match(regForUrl)) {
    return {
      type: 'url',
      src: str.match(regForUrl)![0].replace(/^<gomoon-url src="(.+?)".*?\/>$/, '$1')
    }
  }
  resetReg()
  return {
    type: 'text'
  }
}
