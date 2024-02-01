import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentDisplay } from '@renderer/lib/ai/parseString'
import { decorateContent } from './utils'
import NetworkIcon from '@renderer/assets/icon/NetworkIcon'
import LinkIcon from '@renderer/assets/icon/LinkIcon'

export default function (meta: ContentDisplay) {
  if (meta.type === 'file') {
    return (
      <div class="flex cursor-pointer items-center overflow-hidden">
        <span class="mr-1">我:</span>
        <BaseFileIcon class="shrink-0 grow-0 text-text2" width={18} height={18} />
        <span class="truncate text-text2">{decorateContent(meta.filename)}</span>
      </div>
    )
  }
  if (meta.type === 'url') {
    return (
      <div>
        <span class="flex items-start">
          <span class="mr-1">我:</span>
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
          <span class="mr-1">我:</span>
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
  return null
}
