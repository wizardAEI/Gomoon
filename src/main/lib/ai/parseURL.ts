import puppeteer from 'puppeteer'
export async function parseURL2Str(url: string) {
  const page = await (await puppeteer.launch()).newPage()
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 10000 })
  } catch {
    return '内容解析失败'
  }
  const mainContent = await page.evaluate(() => {
    const content = document.querySelector('body')
    return content ? content.innerText : ''
  })

  return mainContent
}
