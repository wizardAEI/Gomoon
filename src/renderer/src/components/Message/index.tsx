import { Roles } from '@renderer/lib/ai/langchain'
import { For, Show, createMemo } from 'solid-js'
import 'highlight.js/styles/atom-one-dark.css'
import { msgStatus, msgs } from '@renderer/store/chat'
import MsgPopup, { MsgPopupForUser, Pause, WithDrawal } from './Popup'
import { ansStatus } from '@renderer/store/answer'
import { parseDisplayArr } from '@renderer/lib/ai/parseString'
import SpecialTypeContent from './SpecialTypeContent'
import Md, { mdToText } from './Md'
import { setPageData } from '@renderer/store/user'
import { event } from '@renderer/lib/util'
export type MsgTypes = Roles | 'ans' | 'question'
export const style: Record<MsgTypes, string> = {
  ai: 'bg-dark',
  human: 'bg-light',
  system: 'bg-dark',
  question: 'bg-light',
  ans: 'bg-dark'
}
export const mdStyle: Record<MsgTypes, string> = {
  ai: 'text-sm',
  ans: 'text-sm',
  human: 'text-sm text-text-dark',
  system: 'text-base select-none text-center text-base dark-theme px-4',
  question: 'text-sm text-text-dark'
}
export default function Message(props: {
  type: MsgTypes
  id?: string
  content: string
  botName?: string
  isEmpty?: boolean
}) {
  const meta = createMemo(() => {
    return parseDisplayArr(props.content)
  })
  // FEAT: 是否显示小组件
  const showComps = createMemo(
    () =>
      (props.type === 'ai' && props.id && !msgStatus.generatingList.includes(props.id)) ||
      (props.type === 'ans' && !ansStatus.isGenerating)
  )
  const showCompsByUser = createMemo(() => {
    if (props.id) {
      const genIndex = msgs.findIndex((msg) => msg.id === props.id) + 1
      return (
        !msgStatus.generatingList.includes(msgs[genIndex]?.id || '') &&
        props.type === 'human' &&
        !meta().find((item) => item.type !== 'text')
      )
    }
    return false
  })

  const audio = new Audio()
  audio.autoplay = true
  audio.onended = () => {
    console.log('ended')
    setPageData('isSpeech', false)
    audio.removeAttribute('src')
    audio.load()
  }
  audio.onerror = (e) => {
    console.error(e)
    setPageData('isSpeech', false)
    audio.removeAttribute('src')
  }
  event.on('stopSpeak', () => {
    audio.pause()
    setPageData('isSpeech', false)
    audio.removeAttribute('src')
  })
  function speakText(content: string) {
    let buffers: ArrayBuffer[] = []
    let timer: NodeJS.Timeout | null = null
    const mediaSource = new MediaSource()
    const sourceURL = URL.createObjectURL(mediaSource)
    audio.src = sourceURL
    setPageData('isSpeech', true)
    mediaSource.addEventListener('sourceopen', function () {
      const sourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs=opus')
      const append = () => {
        if (buffers.length === 0 || sourceBuffer.updating) return
        sourceBuffer.appendBuffer(buffers[0])
        buffers.shift()
        sourceBuffer.onupdateend = append
      }
      const cancelReceive = window.api.receiveBuf(async (_, buf) => {
        // FEAT: Buffer有用的数据可能只是部分，这里使用偏移量来确保获取到正确数据而不是整个ArrayBuffer
        buffers.push(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
        append()
      })
      window.api.speak(content).then((_) => {
        cancelReceive()
        timer = setInterval(() => {
          if (!buffers.length && !sourceBuffer.updating) {
            mediaSource.endOfStream()
            clearInterval(timer!)
          }
        }, 300)
      })
    })
  }
  function speakMd() {
    const contents = meta()
      .filter((item) => item.type === 'text')
      .map((item: any) => item.content)
      .join('\n')
    speakText(mdToText(contents))
  }

  return (
    <div class="group relative max-w-full">
      <Show
        when={
          (props.id && msgStatus.generatingList.includes(props.id)) ||
          (props.type === 'ans' && ansStatus.isGenerating)
        }
      >
        <Pause id={props.id} type={props.type} />
      </Show>
      <Show
        when={!props.isEmpty}
        fallback={
          <Show when={props.id && !msgStatus.generatingList.includes(props.id)}>
            <WithDrawal type={props.type} />
          </Show>
        }
      >
        <Show when={showComps()}>
          <MsgPopup
            type={props.type}
            id={props.id || ''}
            content={props.content}
            onSpeak={speakMd}
          />
        </Show>
        <Show when={showCompsByUser()}>
          <MsgPopupForUser type={props.type} id={props.id || ''} content={props.content} />
        </Show>
      </Show>
      <div class={style[props.type] + ' relative m-4 rounded-2xl p-3'}>
        <For each={meta()}>
          {(m) =>
            m.type === 'text' ? (
              <Md
                class={mdStyle[props.type] + ' markdown break-words'}
                content={m.content}
                onSpeak={speakText}
              />
            ) : (
              SpecialTypeContent(m, mdStyle[props.type])
            )
          }
        </For>
      </div>
    </div>
  )
}
