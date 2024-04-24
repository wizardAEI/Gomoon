import puppeteer from 'puppeteer'
import fetch from 'node-fetch'
import { load } from 'cheerio'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
// TODO: 转md
export async function parseURL2Str(url: string): Promise<string> {
  const html = await fetch(url, {
    timeout: 10000
  })
    .then((res) => res.text())
    .catch((e) => {
      return e.message
    })
  const $ = load(html)
  const doc = new Readability(new JSDOM($.html()).window.document).parse()
  if (doc && doc?.textContent.length > 150 && doc.siteName !== '微信公众平台') {
    return `${doc.title}\n\n` + doc.textContent
  }
  // 如果内容过少，则怀疑为单页面应用或遇到安全验证，使用puppeteer解析
  try {
    const page = await (await puppeteer.launch()).newPage()
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
    const doc = new Readability(new JSDOM(await page.content()).window.document).parse() || {
      title: '',
      textContent: ''
    }
    // 释放资源
    await page.close()
    return `${doc.title}\n\n` + doc.textContent
  } catch (e) {
    if ((e as Error).message.includes('timeout')) throw new Error('页面解析超时')
    if (doc) {
      return `${doc.title}\n\n` + doc.content
    } else {
      throw new Error('页面解析超时')
    }
  }
}
