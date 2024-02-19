import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentDisplay } from '@renderer/lib/ai/parseString'
import { decorateContent } from './utils'
import NetworkIcon from '@renderer/assets/icon/NetworkIcon'
import LinkIcon from '@renderer/assets/icon/LinkIcon'
import CapsuleIcon from '@renderer/assets/icon/CapsuleIcon'

export default function (meta: ContentDisplay, role = '我', index: number) {
  if (meta.type === 'file') {
    return (
      <div class="flex cursor-pointer items-center overflow-hidden">
        {index === 0 && <span class="mr-1">{role}</span>}
        <BaseFileIcon class="shrink-0 grow-0 text-text2" width={18} height={18} />
        <span class="truncate text-text2">{decorateContent(meta.filename)}</span>
      </div>
    )
  }
  if (meta.type === 'url') {
    return (
      <div>
        <span class="flex items-start">
          {index === 0 && <span class="mr-1">我:</span>}
          <LinkIcon
            class="mr-[2px] shrink-0 grow-0 text-text-dark2 group-hover/link:text-active"
            width={14}
            height={20}
          />
          <a class="truncate text-text-dark2" href={meta.src} target="_blank" rel="noreferrer">
            {decorateContent(meta.src)}
          </a>
        </span>
      </div>
    )
  }
  if (meta.type === 'search') {
    return (
      <div>
        <span class="flex items-start break-words">
          {index === 0 && <span class="mr-1">我:</span>}
          <NetworkIcon
            class="shrink-0 grow-0 translate-y-[1px] text-text2"
            width={18}
            height={18}
          />
          <span class="text-text2">{decorateContent(meta.question)}</span>
        </span>
      </div>
    )
  }
  if (meta.type === 'memo') {
    return (
      <div>
        <span class="flex items-start break-words">
          {index === 0 && <span class="mr-1">我:</span>}
          <CapsuleIcon
            class="shrink-0 grow-0 translate-y-[1px] pr-[2px] text-text2"
            width={17}
            height={17}
          />
          <span class="text-text2">{decorateContent(meta.question)}</span>
        </span>
      </div>
    )
  }
  return null
}
