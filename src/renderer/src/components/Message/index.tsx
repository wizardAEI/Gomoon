import { Roles } from '@renderer/lib/ai/langchain'
import { For, Show, createEffect, createMemo } from 'solid-js'
import 'highlight.js/styles/atom-one-dark.css'
import { msgStatus, msgs } from '@renderer/store/chat'
import { ansStatus } from '@renderer/store/answer'
import { parseDisplayArr } from '@renderer/lib/ai/parseString'
import { setPageData } from '@renderer/store/user'
import { event } from '@renderer/lib/util'
import { settingStore } from '@renderer/store/setting'

import SpecialTypeContent from './SpecialTypeContent'
import Md, { mdToText } from './Md'
import MsgPopup, { MsgPopupForSpecialContent, MsgPopupForUser, Pause, WithDrawal } from './Actions'
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
  editing?: boolean
  isEmpty?: boolean
  onRemove?: () => void
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
    const buffers: ArrayBuffer[] = []
    let timer: NodeJS.Timeout | null = null
    const mediaSource = new MediaSource()
    const sourceURL = URL.createObjectURL(mediaSource)
    audio.src = sourceURL
    setPageData('isSpeech', true)
    mediaSource.addEventListener('sourceopen', function () {
      try {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs=opus')
        const append = () => {
          if (buffers.length === 0 || sourceBuffer.updating || mediaSource.readyState !== 'open')
            return
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
      } catch (e) {
        console.error(e)
      }
    })
  }
  function speakMd() {
    const contents = meta()
      .filter((item) => item.type === 'text')
      .map((item: any) => item.content)
      .join('\n')
    speakText(mdToText(contents))
  }
  createEffect(() => {
    document.documentElement.style.setProperty(
      '--gomoon-md-fontsize',
      `${settingStore.chatFontSize}px`
    )
  })
  return (
    <div class="group relative max-w-full">
      <div class={style[props.type] + ' relative mx-3 my-4 rounded-xl px-3 py-[10px]'}>
        <Show
          when={
            (props.id && msgStatus.generatingList.includes(props.id)) ||
            (props.type === 'ans' && ansStatus.isGenerating)
          }
        >
          <Pause id={props.id} type={props.type} />
        </Show>
        <For each={meta()}>
          {(m) =>
            m.type === 'text' ? (
              <Md class={mdStyle[props.type]} content={m.content} onSpeak={speakText} />
            ) : (
              SpecialTypeContent(m, mdStyle[props.type])
            )
          }
        </For>
        <Show when={showComps() && !props.editing}>
          <MsgPopup
            type={props.type}
            id={props.id || ''}
            content={props.content}
            onSpeak={speakMd}
          />
        </Show>
        <Show
          when={!props.editing}
          fallback={
            <Show when={props.id && !msgStatus.generatingList.includes(props.id)}>
              <WithDrawal type={props.type} />
            </Show>
          }
        >
          <Show
            when={showCompsByUser()}
            fallback={
              <MsgPopupForSpecialContent
                type={props.type}
                onRemove={props.onRemove || (() => {})}
              />
            }
          >
            <MsgPopupForUser
              type={props.type}
              id={props.id || ''}
              content={props.content}
              onRemove={props.onRemove || (() => {})}
            />
          </Show>
        </Show>
      </div>
    </div>
  )
}
