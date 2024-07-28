/* eslint-disable solid/components-return-once */
import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentDisplay } from '@renderer/lib/ai/parseString'
import NetworkIcon from '@renderer/assets/icon/BrowserIcon'
import LinkIcon from '@renderer/assets/icon/LinkIcon'
import CapsuleIcon from '@renderer/assets/icon/CapsuleIcon'

import { decorateContent } from './utils'

// 预渲染一遍，不考虑响应式
export default function SpecialTypeContent(meta: ContentDisplay, displayFull?: boolean) {
  if (meta.type === 'file') {
    return (
      <div
        onClick={() => {
          if (displayFull) {
            window.api.openPath(meta.src)
          }
        }}
        class="inline-flex cursor-pointer items-center overflow-hidden"
      >
        <BaseFileIcon class="shrink-0 grow-0 text-text2" width={18} height={18} />
        <span class="truncate text-text2">{decorateContent(meta.filename)}</span>
      </div>
    )
  }
  if (meta.type === 'url') {
    return (
      <div class="inline-flex items-start">
        <LinkIcon
          class="mr-[2px] shrink-0 grow-0 text-text-dark2 group-hover/link:text-active"
          width={14}
          height={20}
        />
        <a class="truncate text-text-dark2" href={meta.src} target="_blank" rel="noreferrer">
          {decorateContent(meta.src)}
        </a>
      </div>
    )
  }
  if (meta.type === 'search') {
    return (
      <span class="inline-flex items-start break-words">
        <NetworkIcon class="shrink-0 grow-0 translate-y-[1px] text-text2" width={18} height={18} />
        <span class="text-text2">{decorateContent(meta.question)}</span>
      </span>
    )
  }
  if (meta.type === 'memo') {
    return (
      <span class="inline-flex items-start break-words">
        <CapsuleIcon
          class="shrink-0 grow-0 translate-y-[1px] pr-[2px] text-text2"
          width={17}
          height={17}
        />
        <span class="text-text2">{decorateContent(meta.question)}</span>
      </span>
    )
  }
  if (meta.type === 'image') {
    return (
      <span>
        <img
          onClick={() => {
            if (displayFull) {
              window.api.openPath(meta.src)
            }
          }}
          src={meta.value}
          class={'inline cursor-pointer rounded-sm ' + (displayFull ? 'max-h-14' : 'w-6')}
        />
        <br />
      </span>
    )
  }
  return null
}
