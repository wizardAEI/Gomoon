import puppeteer from 'puppeteer'
// TODO: 转md
export async function parseURL2Str(url: string) {
  const page = await (await puppeteer.launch()).newPage()
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 10000 })
  } catch {
    return '内容解析失败'
  }
  const mainContent = await page.evaluate(() => {
    const total = document.querySelector('body')
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
          el.nodeName === 'IFRAME'
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
    const title = document.querySelector('title')?.innerText || ''
    return `${title}\n\n` + findMainContent(total)
  })
  // 释放资源
  await page.close()
  return mainContent
}
