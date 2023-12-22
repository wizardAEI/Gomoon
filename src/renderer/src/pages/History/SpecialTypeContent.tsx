import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentMetaData } from '@renderer/lib/ai/parseString'
import { decorateContent } from './utils'

export default function (meta: ContentMetaData) {
  if (meta.type === 'file') {
    return (
      <div class="flex cursor-pointer items-center overflow-hidden">
        我: <BaseFileIcon class="pl-1" width={18} height={18} />
        <span class=" break-words">{decorateContent(meta.filename)}</span>
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
        我: <span class="break-words">{decorateContent(meta.question)}</span>
      </div>
    )
  }
  return null
}
