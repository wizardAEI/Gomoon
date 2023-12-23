import { nonStreamingAssistant } from '../langchain'

export async function parsePageToString(url: string): Promise<string> {
  return window.api.parsePageToString(url)
}

export async function parsePageForUrl(url: string) {
  let content = await parsePageToString(url)
  if (content.length > 2000) {
    content = content.slice(0, 2000) + '...'
  }
  return (
    `<gomoon-url src="${url}"/>接下来我将会给你一个网址下的全部文本内容，这其中可能会包括一些标题，用户信息，备案号，相关推荐，按钮内容等。请你剔除无效信息来理解内容，并给出一个精简的总结：\n` +
    content
  )
}

// export async function parsePageForSearch(url: string, question: string) {
//   let content = await parsePageToString(url)
//   if (content.length > 2000) {
//     content = content.slice(0, 2000) + '...'
//   }
//   return await nonStreamingAssistant(
//     `\n\n\n下面是一个网页的全部文本内容，这其中可能会包括一些标题，用户信息，备案号，相关推荐，按钮内容等。请你剔除无效信息来理解内容，简单精确的回答 ${question} 这个问题(回答过程中不用刻意提及自己是从网页内容中获取的信息):\n` +
//       content
//   )
// }

export async function parsePageForSearch(url: string) {
  let content = await parsePageToString(url)
  if (content.length > 1500) {
    content = content.slice(0, 2000) + '...'
  }
  return content
}
