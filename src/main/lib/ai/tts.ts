import { WebSocket } from 'ws'
import { randomBytes } from 'crypto'
import { PostBuffToMainWindow } from '../../window'
export class Service {
  private ws: WebSocket | null = null

  private timer: NodeJS.Timeout | null = null

  public newBufferHandler: (buffer: Buffer) => void

  private convertPromise: {
    resolve: (value?: Buffer) => void
    reject: (reason?: any) => void
  }

  private buffer: Buffer

  constructor(newBufferHandler: (buffer: Buffer) => void) {
    this.convertPromise = {
      resolve: () => {},
      reject: () => {}
    }
    this.buffer = Buffer.from([])
    this.newBufferHandler = newBufferHandler
  }

  private async connect(): Promise<WebSocket> {
    const connectionId = randomBytes(16).toString('hex').toLowerCase()
    let url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${connectionId}`
    let ws = new WebSocket(url, {
      host: 'speech.platform.bing.com',
      origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.66 Safari/537.36 Edg/103.0.1264.44'
      }
    })
    return new Promise((resolve, reject) => {
      ws.on('close', (code, reason) => {
        // 服务器会自动断开空闲超过30秒的连接
        this.ws = null
        if (this.timer) {
          clearTimeout(this.timer)
          this.timer = null
        }
        console.info(`连接已关闭： ${reason} ${code}`)
      })
      ws.on('message', (message, isBinary) => {
        let pattern = /X-RequestId:(?<id>[a-z|0-9]*)/
        if (!isBinary) {
          let data = message.toString()
          if (data.includes('Path:turn.start')) {
            let matches = data.match(pattern)
            let requestId = matches!.groups!.id
            console.info(`开始传输：${requestId}`)
          } else if (data.includes('Path:turn.end')) {
            this.convertPromise.resolve(this.buffer)
            this.ws?.close(1000)
          }
        } else if (isBinary) {
          let separator = 'Path:audio\r\n'
          let data = message as string | Buffer
          let contentIndex = data.indexOf(separator) + separator.length
          let content = data.slice(contentIndex) as Buffer
          this.buffer = Buffer.concat([this.buffer, content])
          this.newBufferHandler(content as Buffer)
        }
      })
      ws.on('error', (error) => {
        reject(`连接失败： ${error}`)
      })
      ws.on('open', () => {
        resolve(ws)
      })
    })
  }

  public async convert(ssml: string, format: string) {
    if (this.ws == null || this.ws.readyState != WebSocket.OPEN) {
      console.info('准备连接服务器……')
      let connection = await this.connect()
      this.ws = connection
    }
    const requestId = randomBytes(16).toString('hex').toLowerCase()
    let configData = {
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
    let configMessage =
      `X-Timestamp:${Date()}\r\n` +
      'Content-Type:application/json; charset=utf-8\r\n' +
      'Path:speech.config\r\n\r\n' +
      JSON.stringify(configData)
    this.ws?.send(configMessage, (configError) => {
      if (configError) {
        console.error(`配置请求发送失败：${requestId}\n`, configError)
      }
      // 发送SSML消息
      let ssmlMessage =
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
    // 收到请求，清除超时定时器
    if (this.timer) {
      console.debug('收到新的请求，清除超时定时器')
      clearTimeout(this.timer)
    }
    // 设置定时器，超过10秒没有收到请求，主动断开连接
    this.timer = setTimeout(() => {
      if (this.ws && this.ws.readyState == WebSocket.OPEN) {
        console.debug('已经 10 秒没有请求，主动关闭连接')
        this.ws.close(1000)
        this.timer = null
      }
    }, 10000)
    return new Promise((resolve, reject) => {
      this.convertPromise.resolve = resolve
      this.convertPromise.reject = reject
    })
  }
}

function createSSML(text, voiceName) {
  text = text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll("'", '&apos;')
    .replaceAll('"', '&quot;')
  let ssml =
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

export const speak = async (content: string) => {
  const service = new Service((buff) => {
    PostBuffToMainWindow(buff)
  })
  let ssml = createSSML(content, 'zh-CN-XiaoxiaoNeural')
  return await service.convert(ssml, 'webm-24khz-16bit-mono-opus')
}
