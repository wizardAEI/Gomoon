import puppeteer, { Page } from 'puppeteer'
let page: Page | null = null
export async function parseURL2Str(url: string) {
  if (!page) {
    page = await (await puppeteer.launch()).newPage()
  }
  await page.goto(url, { waitUntil: 'load' })
  const mainContent = await page.evaluate(() => {
    const content = document.querySelector('body')
    return content ? content.innerText : ''
  })

  return mainContent
}
