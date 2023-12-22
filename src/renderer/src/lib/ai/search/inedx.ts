import axios from 'axios'
import { load } from 'cheerio'
import { nonStreamingAssistant } from '../langchain'
import { parsePageForSearch } from '../url'

async function fetchBaiduResults(keyword) {
  const searchUrl = `http://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`
  console.log(searchUrl)
  const { data } = await axios.get(searchUrl)
  const $ = load(data)
  const links: string[] = []
  $('.t a').each((_, element) => {
    // TODO: 识别广告
    const link = $(element).attr('href')
    link && links.push(link)
  })
  return links
}

function processQuery(content: string) {
  // 提取出<>包裹的查询内容, e.g. <大熊猫，存活> -> 大熊猫，存活
  console.log(content)
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
  const prompt = `请根据 ${question} 给我一个使用于搜索引擎的关键词，并使用<>包裹。除了关键词外不要添加任何其他内容。`
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
    throw new Error('查询创建失败')
  }
  logger('收集链接中...')
  const links = (await fetchBaiduResults(processedContent.query)).sort(() => Math.random() - 0.5)
  console.log(links)
  let content = `<gomoon-search question="${question}"/>接下来我将会给你3个网址下的全部文本内容，这其中可能会包括一些标题，用户信息，备案号，相关推荐，按钮内容等。请你剔除无效信息来理解内容，回答 ${question} 这个问题(回答过程中不用刻意提及自己是从网页内容中获取的信息):\n`
  for (let i = 0; i < 3; i++) {
    logger(`解析第${i + 1}个链接中...`)
    content += await parsePageForSearch(links[i])
  }
  return content
}
