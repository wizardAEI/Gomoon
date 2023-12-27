type cspItem = 'default-src' | 'script-src' | 'style-src' | 'connect-src' | 'img-src' | 'worker-src'
function csp(items?: {
  [key in cspItem]?: string[]
}) {
  const defaultItem: {
    [key in cspItem]: string[]
  } = {
    'default-src': [],
    'script-src': ['https://cdn.jsdelivr.net', "'unsafe-eval'"],
    'style-src': ["'unsafe-inline'"],
    'connect-src': [
      'https://dashscope.aliyuncs.com',
      'https://api.openai.com',
      'https://tiktoken.pages.dev',
      'https://aip.baidubce.com',
      'https://cdn.jsdelivr.net',
      'http://www.baidu.com',
      'data:'
    ],
    'img-src': ['https:', 'http:', 'data:', 'blob:'],
    'worker-src': ['blob:']
  }
  let cspStr = ''
  function item2Str(item: string[] | undefined) {
    if (!item) {
      return ''
    }
    return item.join(' ')
  }
  for (let item in defaultItem) {
    cspStr +=
      item +
      " 'self' " +
      item2Str(defaultItem[item as cspItem]) +
      ' ' +
      item2Str(items?.[item]) +
      '; '
  }
  return cspStr
  // "default-src 'self'; script-src https://cdn.jsdelivr.net 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://dashscope.aliyuncs.com https://api.openai.com https://api.chatanywhere.com.cn https://api.chatanywhere.tech  https://tiktoken.pages.dev https://aip.baidubce.com https://cdn.jsdelivr.net http://www.baidu.com data:; img-src https: http: data: 'self'; worker-src 'self' blob:;"
}

console.log(
  csp({
    'connect-src': ['https://api.chatanywhere.tech']
  })
)
