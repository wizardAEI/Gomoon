import { load } from 'cheerio'
import { nonStreamingAssistant } from '../langchain'
import { parsePageToString } from '../url'

async function fetchBaiduResults(keyword) {
  const searchUrl = `http://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`
  const html = await fetch(searchUrl).then((res) => res.text())
  const $ = load(html)
  const links: string[] = []
  $('.t a').each((_, element) => {
    // TODO: 识别广告
    const link = $(element).attr('href')
    link && links.push(link)
  })
  return links
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
  const links = (await fetchBaiduResults(processedContent.query)).sort(() => Math.random() - 0.5)
  const valuableLinks: string[] = []
  const linkNum = links.length
  while (links.length) {
    if (valuableLinks.length >= 2) {
      break
    }
    const link = links.pop()
    const prompt2 = `我讲给你一段网页内容，请分析内容并判断该网页是否可能和问题 ${question} 有关，如果相关请回复yes，否则请回复no。不要添加任何其他内容。
    网页内容：
    ${(await parsePageToString(link!)).slice(0, 150)}
    `
    const c = (await nonStreamingAssistant(prompt2)).content as string
    if (c.includes('yes')) {
      valuableLinks.push(link!)
    }
    logger(
      `收集链接中(${valuableLinks.length}/2)，${
        linkNum - links.length - valuableLinks.length
      }个无效链接`
    )
  }
  if (valuableLinks.length === 0) {
    throw new Error('没有获取到有效的链接，请重新提问')
  }
  let content = `接下来我将会给你几个可能与\n ${question} \n这个问题有关的网页文本内容（这其中可能会包括一些标题，用户信息，备案号，相关推荐，按钮内容等。请你剔除无效信息）。请综合理解信息并直接给出最终答案，不要多余的解释。(不要说自己不能联网或获取不到实时信息等):\n`
  logger(`解析链接中...`)
  const res = await Promise.all(valuableLinks.map((link) => parsePageToString(link)))
  res.map((r, i) => {
    content += `\n\n\n第${i + 1}个网页信息：${r}`
  })
  return `<gomoon-search><gomoon-question>${question}</gomoon-question><gomoon-val>${content}</gomoon-val></gomoon-search>`
}
