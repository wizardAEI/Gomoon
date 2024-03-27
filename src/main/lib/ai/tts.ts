import { randomBytes } from 'crypto'

import { WebSocket } from 'ws'

import { PostBuffToMainWindow } from '../../window'

function createSSML(text, voiceName) {
  text = text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll("'", '&apos;')
    .replaceAll('"', '&quot;')
  const ssml =
    '\
        <speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">\
          <voice name="' +
    voiceName +
    '">\
              <prosody rate="0%" pitch="0%">\
                  ' +
    text +
    '\
              </prosody >\
          </voice >\
        </speak > '

  return ssml
}

class Service {
  private ws: WebSocket | null = null

  public newBufferHandler: (buffer: Buffer) => void

  private convertPromise: {
    resolve: (value?: Buffer) => void
    reject: (reason?: any) => void
  }

  private buffers: Buffer
  private requestId = ''

  constructor(newBufferHandler: (buffer: Buffer) => void) {
    this.convertPromise = {
      resolve: () => {},
      reject: () => {}
    }
    this.buffers = Buffer.from([])
    this.newBufferHandler = newBufferHandler
  }

  private async connect(): Promise<WebSocket> {
    const connectionId = randomBytes(16).toString('hex').toLowerCase()
    const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${connectionId}`
    const ws = new WebSocket(url, {
      host: 'speech.platform.bing.com',
      origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.66 Safari/537.36 Edg/103.0.1264.44'
      }
    })
    return new Promise((resolve, reject) => {
      ws.on('close', (code, reason) => {
        this.ws = null
        console.info(`连接已关闭： ${reason} ${code}`)
      })
      ws.on('message', (message, isBinary) => {
        const pattern = /X-RequestId:(?<id>[a-z|0-9]*)/
        if (!isBinary) {
          const data = message.toString()
          if (data.includes('Path:turn.start')) {
            const matches = data.match(pattern)
            this.requestId = matches!.groups!.id
            this.buffers = Buffer.from([])
          } else if (data.includes('Path:turn.end')) {
            this.convertPromise.resolve(this.buffers)
            // this.ws?.close(1000)
          }
        } else if (isBinary) {
          const matches = message.toString().match(pattern)
          if (this.requestId !== matches!.groups!.id) return
          const separator = 'Path:audio\r\n'
          const data = message as string | Buffer
          const contentIndex = data.indexOf(separator) + separator.length
          const content = data.slice(contentIndex) as Buffer
          this.buffers = Buffer.concat([this.buffers, content])
          this.newBufferHandler(content as Buffer)
        }
      })
      ws.on('error', (error) => {
        this.ws = null
        reject(`连接失败： ${error}`)
      })
      ws.on('open', () => {
        resolve(ws)
      })
    })
  }

  public async convert(ssml: string, format: string) {
    if (this.ws === null || this.ws.readyState != WebSocket.OPEN) {
      const connection = await this.connect()
      this.ws = connection
    }
    const requestId = randomBytes(16).toString('hex').toLowerCase()
    const configData = {
      context: {
        synthesis: {
          audio: {
            metadataoptions: {
              sentenceBoundaryEnabled: 'false',
              wordBoundaryEnabled: 'false'
            },
            outputFormat: format
          }
        }
      }
    }
    const configMessage =
      `X-Timestamp:${Date()}\r\n` +
      'Content-Type:application/json; charset=utf-8\r\n' +
      'Path:speech.config\r\n\r\n' +
      JSON.stringify(configData)
    this.ws?.send(configMessage, (configError) => {
      if (configError) {
        console.error(`配置请求发送失败：${requestId}\n`, configError)
      }
      // 发送SSML消息
      const ssmlMessage =
        `X-Timestamp:${Date()}\r\n` +
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml
      this.ws!.send(ssmlMessage, (ssmlError) => {
        if (ssmlError) {
          console.error(`SSML消息发送失败：${requestId}\n`, ssmlError)
        }
      })
    })
    return new Promise((resolve, reject) => {
      this.convertPromise.resolve = resolve
      this.convertPromise.reject = reject
    })
  }
}

const service = new Service((buff) => {
  PostBuffToMainWindow(buff)
})

export const speak = async (content: string) => {
  const ssml = createSSML(content, 'zh-CN-XiaoxiaoNeural')
  return await service.convert(ssml, 'webm-24khz-16bit-mono-opus')
}
