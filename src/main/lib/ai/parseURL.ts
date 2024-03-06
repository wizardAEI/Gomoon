import puppeteer from 'puppeteer'
import fetch from 'node-fetch'
import { load } from 'cheerio'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
// TODO: 转md
export async function parseURL2Str(url: string) {
  const html = await fetch(url, {
    timeout: 10000
  })
    .then((res) => res.text())
    .catch((e) => {
      return e.message
    })
  const $ = load(html)
  const doc = new Readability(new JSDOM($.html()).window.document).parse()
  if (doc && doc?.content.length > 50) {
    return `${doc.title}\n\n` + doc.textContent
  }
  // 如果内容过少，则怀疑为单页面应用或遇到安全验证，使用puppeteer解析
  try {
    const page = await (await puppeteer.launch()).newPage()
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
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
  } catch (e) {
    if ((e as Error).message.includes('timeout')) throw new Error('页面解析超时')
    if (doc) {
      return `${doc.title}\n\n` + doc.content
    } else {
      throw new Error('页面解析超时')
    }
  }
}
