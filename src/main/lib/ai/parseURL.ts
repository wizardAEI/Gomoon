import puppeteer from 'puppeteer'
import fetch from 'node-fetch'
import { Cheerio, Element, load } from 'cheerio'
// TODO: 转md
export async function parseURL2Str(url: string) {
  const html = await fetch(url).then((res) => res.text())
  const $ = load(html)
  $('script').remove()
  const title = $('title').text()
  // 去除回车和空格
  const bodyContent = $('body').text().replace(/\s+/g, '')
  if (bodyContent.length > 50) {
    function mainContent(node: Cheerio<Element>) {
      for (let i = 0; i < node.contents().length; i++) {
        const child = node.contents()[i]
        if (child.type === 'text') {
          // 如果是文本节点，则替换文本
          return $(child).text()
        } else if (
          child.type === 'tag' &&
          !['script', 'style', 'svg'].includes(child.tagName.toLowerCase()) &&
          $(child).text().length > $('body').text().length * 0.8
        ) {
          return mainContent($(child))
        }
      }
      return node.text()
    }
    return `${title}\n\n` + mainContent($('body'))
  }

  // 如果内容过少，则怀疑为单页面应用或遇到安全验证，使用puppeteer解析
  const page = await (await puppeteer.launch()).newPage()
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  } catch (e) {
    if ((e as Error).message.includes('timeout')) return '页面解析超时'
    return '内容解析失败'
  }
  const mainContent = await page.evaluate(() => {
    const title = document.querySelector('title')?.innerText || ''
    const total = document.querySelector('body') || ''
    if (!total) return '...'
    const totalLength = total.innerText.length
    const parseNode = (
      el: ChildNode
    ): {
      type: 'text' | 'element'
      content: string
    } => {
      if (el.nodeType === 3)
        return {
          type: 'text',
          content: el.textContent || ''
        }
      if (el.nodeType === 1)
        if (
          el.nodeName === 'SCRIPT' ||
          el.nodeName === 'STYLE' ||
          el.nodeName === 'NOSCRIPT' ||
          el.nodeName === 'IFRAME' ||
          el.nodeName === 'LINK' ||
          el.nodeName === 'SVG'
        )
          // 排除一些不需要的元素，例如script
          return {
            type: 'text',
            content: ''
          }
      return {
        type: 'element',
        content: (el as HTMLElement).innerText || ''
      }
    }
    const findMainContent = (ele: HTMLElement): string => {
      const children = ele.childNodes
      if (children.length === 0) return ele.innerText
      for (let i = 0; i < children.length; i++) {
        if (parseNode(children[i]).content.length > totalLength * 0.8) {
          if (parseNode(children[i]).type === 'element') {
            return findMainContent(children[i] as HTMLElement)
          }
          return parseNode(children[i]).content
        }
      }
      return ele.innerText
    }
    // 获取标题
    return `${title}\n\n` + findMainContent(total)
  })
  // 释放资源
  await page.close()
  return mainContent
}
