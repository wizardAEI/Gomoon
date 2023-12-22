import puppeteer from 'puppeteer'
export async function parseURL2Str(url: string) {
  const page = await (await puppeteer.launch()).newPage()
  await page.goto(url, { waitUntil: 'load' })
  const mainContent = await page.evaluate(() => {
    const content = document.querySelector('body')
    return content ? content.innerText : ''
  })

  return mainContent
}
