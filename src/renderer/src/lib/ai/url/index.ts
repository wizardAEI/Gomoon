// TODO: 优化内容获取截取逻辑（或者分片）
export async function parsePageToString(url: string): Promise<string> {
  // const content = await window.api.parsePageToString(url)
  // if (content.length > 2500) {
  //   return content.slice(0, 2500) + '...'
  // }
  try {
    return await window.api.parsePageToString(url)
  } catch (e) {
    return (e as Error).message
  }
}

export async function parsePageForUrl(url: string) {
  const content = await parsePageToString(url)
  return (
    `<gomoon-url src="${url}"/>这是一个网址下的文本内容，其中可能会包括一些标题，用户信息，备案号，相关推荐，按钮内容等无效信息：\n` +
    content +
    '</gomoon-url>'
  )
}
