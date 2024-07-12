import { nonStreamingAssistant } from '../langchain'
import { parsePageToString } from '../url'

async function fetchBaiduResults(keyword) {
  const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}&pn=1&rn=5&tn=json`
  const data = await fetch(searchUrl).then((res) => res.json())
  if (!data.feed?.entry?.length) {
    return []
  }
  const links: {
    summary: string
    link: string
  }[] = []

  links.push(
    ...data.feed.entry.map((item) => ({
      summary: item.abs,
      link: item.url
    }))
  )

  return links.filter(({ summary }) => summary)
}

function processQuery(content: string) {
  const reg = /<(.+?)>/
  if (content.match(reg)) {
    return {
      suc: true,
      query: content.match(reg)![0].replace(/<(.+?)>$/, '$1')
    }
  }
  return {
    suc: false,
    query: ''
  }
}
export async function searchByBaidu(question: string, logger: (content: string) => void) {
  const prompt = `请根据『 ${question} 』这个问题给我一个或多个使用于搜索引擎的关键词，并使用尖括号<>包裹。除了关键词和尖括号外不要添加任何其他内容。例如我问你今天北京的天气，你可以回复：<天气 北京>`
  let times = 3
  logger('创建查询中...')
  let processedContent = {
    suc: false,
    query: ''
  }
  while (times--) {
    const res = await nonStreamingAssistant(prompt)
    processedContent = processQuery(res.content as string)
    if (processedContent.suc) {
      break
    }
    logger('查询创建失败，重新创建中...')
  }
  if (!processedContent.suc) {
    throw new Error('查询创建失败，请重新提问')
  }
  logger('收集链接中...')
  const links = await fetchBaiduResults(processedContent.query)
  const valuableLinks: string[] = []
  const linkNum = links.length
  while (links.length) {
    if (valuableLinks.length >= 2) {
      break
    }
    const link = links.pop()
    const prompt2 = `我将给你一段网页简介，请预测该网页是否可能和问题 ${question} 有关，如果相关请回复yes，否则请回复no。不要添加任何其他内容。
    简介内容：
    ${link!.summary!.slice(0, 150)}
    `
    try {
      const c = (await nonStreamingAssistant(prompt2)).content as string
      if (c.includes('yes')) {
        valuableLinks.push(link!.link)
      }
    } finally {
      logger(
        `收集链接中(${valuableLinks.length}/2)，${
          linkNum - links.length - valuableLinks.length
        }个无效链接`
      )
    }
  }
  if (valuableLinks.length === 0) {
    throw new Error('没有获取到有效的链接，请重新提问')
  }
  let content = `接下来我将会给你几个可能与\n ${question} \n这个问题有关的网页文本内容（这其中可能会包括一些标题，用户信息，备案号，相关推荐，按钮内容等。请你剔除无效信息）。请综合理解信息并直接给出最终答案，不要多余的解释。(不要说自己不能联网或获取不到实时信息等), 请在回答问题后附上参考网页地址:\n`
  logger(`解析链接中...`)
  const res = await Promise.all(
    valuableLinks.map(async (link) => {
      return {
        content: await parsePageToString(link),
        link
      }
    })
  )
  res.map((r, i) => {
    content += `\n\n\n第${i + 1}个[网页](${r.link})信息：${r.content}`
  })
  return `<gomoon-search><gomoon-question>${question}</gomoon-question><gomoon-val>${content}</gomoon-val></gomoon-search>`
}
