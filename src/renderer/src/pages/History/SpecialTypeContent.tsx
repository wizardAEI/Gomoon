import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentMetaData } from '@renderer/lib/ai/parseString'
import { decorateContent } from './utils'
import NetworkIcon from '@renderer/assets/icon/networkIcon'

export default function (meta: ContentMetaData) {
  if (meta.type === 'file') {
    return (
      <div class="flex cursor-pointer items-center gap-1 overflow-hidden">
        我:
        <BaseFileIcon class="text-text2" width={18} height={18} />
        <span class="break-words text-text2">{decorateContent(meta.filename)}</span>
      </div>
    )
  }
  if (meta.type === 'url') {
    return (
      <div>
        我:{' '}
        <a class="text-text-dark2 break-words" href={meta.src} target="_blank" rel="noreferrer">
          {decorateContent(meta.src)}
        </a>
      </div>
    )
  }
  if (meta.type === 'search') {
    return (
      <div>
        <span class="flex items-center gap-1 break-words">
          我:
          <NetworkIcon class="text-text2" width={18} height={18} />
          <span class="text-text2">{decorateContent(meta.question)}</span>
        </span>
      </div>
    )
  }
  return null
}
