import axios from 'axios'
import { load } from 'cheerio'

async function fetchBaiduResults(keyword) {
  const searchUrl = `http://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`
  console.log(searchUrl)
  try {
    const { data } = await axios.get(searchUrl)
    const $ = load(data)
    const links: string[] = []
    $('.t a').each((_, element) => {
      // TODO: 识别广告
      const link = $(element).attr('href')
      link && links.push(link)
    })
    return links
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
