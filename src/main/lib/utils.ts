import { Writable } from 'stream'

import fetch from 'node-fetch'

export function isValidUrl(url: string) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

export async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const contentLength = response.headers.get('Content-Length')
  if (!contentLength) {
    throw new Error('Content-Length header is missing')
  }

  const total = parseInt(contentLength, 10)
  let loaded = 0
  const chunks: any[] = []

  const writableStream = new Writable({
    write(chunk, _, callback) {
      chunks.push(chunk)
      loaded += chunk.length
      onProgress(loaded, total)
      callback()
    }
  })

  response!.body.pipe(writableStream)

  await new Promise((resolve, reject) => {
    writableStream.on('finish', resolve)
    writableStream.on('error', reject)
  })

  return Buffer.concat(chunks)
}
