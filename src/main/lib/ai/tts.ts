import { WebSocket } from 'ws'
import { randomBytes } from 'crypto'
export class Service {
  private ws: WebSocket | null = null

  private executorMap: Map<string, Promise<any>>
  private bufferMap: Map<string, Buffer>

  private timer: NodeJS.Timer | null = null

  public newBufferHandler: (buffer: Buffer) => void

  constructor(newBufferHandler: (buffer: Buffer) => void) {
    this.executorMap = new Map()
    this.bufferMap = new Map()
    this.newBufferHandler = newBufferHandler
  }

  private async connect(): Promise<WebSocket> {
    let connectionId = ''
    const arrayBuffer = new ArrayBuffer(16)
    const view = new Uint8Array(arrayBuffer)
    window.crypto.getRandomValues(view)
    for (let i = 0; i < view.byteLength; i++) {
      connectionId += ('00' + view[i].toString(16)).slice(-2).toLowerCase()
    }
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
        for (let [key, value] of this.executorMap) {
          value.reject(`连接已关闭: ${reason} ${code}`)
        }
        this.executorMap.clear()
        this.bufferMap.clear()
        console.info(`连接已关闭： ${reason} ${code}`)
      })
      ws.on('message', (message, isBinary) => {
        let pattern = /X-RequestId:(?<id>[a-z|0-9]*)/
        if (!isBinary) {
          console.debug('收到文本消息：%s', message)
          let data = message.toString()
          if (data.includes('Path:turn.start')) {
            // 开始传输
            let matches = data.match(pattern)
            let requestId = matches.groups.id
            console.debug(`开始传输：${requestId}……`)
            this.bufferMap.set(requestId, Buffer.from([]))
          } else if (data.includes('Path:turn.end')) {
            // 结束传输
            let matches = data.match(pattern)
            let requestId = matches.groups.id

            let executor = this.executorMap.get(requestId)
            if (executor) {
              this.executorMap.delete(matches.groups.id)
              let result = this.bufferMap.get(requestId)
              executor.resolve(result)
              console.debug(`传输完成：${requestId}……`)
            } else {
              console.debug(`请求已被丢弃：${requestId}`)
            }
          }
        } else if (isBinary) {
          let separator = 'Path:audio\r\n'
          let data = message as Buffer
          this.newBufferHandler(data)
          let contentIndex = data.indexOf(separator) + separator.length

          let headers = data.slice(2, contentIndex).toString()
          let matches = headers.match(pattern)
          let requestId = matches.groups.id

          let content = data.slice(contentIndex)

          console.debug(`收到音频片段：${requestId} Length: ${content.length}\n${headers}`)

          let buffer = this.bufferMap.get(requestId)
          if (buffer) {
            buffer = Buffer.concat([buffer, content])
            this.bufferMap.set(requestId, buffer)
          } else {
            console.debug(`请求已被丢弃：${requestId}`)
          }
        }
      })
      ws.on('error', (error) => {
        reject(`连接失败： ${error}`)
      })
    })
  }

  public async convert(ssml: string, format: string) {
    if (this.ws == null || this.ws.readyState != WebSocket.OPEN) {
      console.info('准备连接服务器……')
      let connection = await this.connect()
      this.ws = connection
      console.info('连接成功！')
    }
    const requestId = randomBytes(16).toString('hex').toLowerCase()
    let result = new Promise((resolve, reject) => {
      // 等待服务器返回后这个方法才会返回结果
      this.executorMap.set(requestId, {
        resolve,
        reject
      })
      // 发送配置消息
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
      console.info(`开始转换：${requestId}……`)
      console.debug(`准备发送配置请求：${requestId}\n`, configMessage)
      this.ws.send(configMessage, (configError) => {
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
        console.debug(`准备发送SSML消息：${requestId}\n`, ssmlMessage)
        this.ws.send(ssmlMessage, (ssmlError) => {
          if (ssmlError) {
            console.error(`SSML消息发送失败：${requestId}\n`, ssmlError)
          }
        })
      })
    })

    // 收到请求，清除超时定时器
    if (this.timer) {
      console.debug('收到新的请求，清除超时定时器')
      clearTimeout(this.timer)
    }
    // 设置定时器，超过10秒没有收到请求，主动断开连接
    console.debug('创建新的超时定时器')
    this.timer = setTimeout(() => {
      if (this.ws && this.ws.readyState == WebSocket.OPEN) {
        console.debug('已经 10 秒没有请求，主动关闭连接')
        this.ws.close(1000)
        this.timer = null
      }
    }, 10000)

    let data = await Promise.race([
      result,
      new Promise((resolve, reject) => {
        // 如果超过 20 秒没有返回结果，则清除请求并返回超时
        setTimeout(() => {
          this.executorMap.delete(requestId)
          this.bufferMap.delete(requestId)
          reject('转换超时')
        }, 10000)
      })
    ])
    console.info(`转换完成：${requestId}`)
    console.info(`剩余 ${this.executorMap.size} 个任务`)
    return data
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

export const speak = (content: string, newBufferHandler: (buffer: Buffer) => void) => {
  const service = new Service(newBufferHandler)
  let ssml = createSSML(content, 'zh-CN-XiaoxiaoNeural')
  service
    .convert(ssml, 'webm-24khz-16bit-mono-opus')
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
}
