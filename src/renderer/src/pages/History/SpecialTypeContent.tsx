import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentMetaData } from '@renderer/lib/ai/parseString'
import { decorateContent } from './utils'

export default function (meta: ContentMetaData) {
  if (meta.type === 'file') {
    return (
      <div class="flex cursor-pointer items-center duration-150">
        <span>我:</span>
        <BaseFileIcon class="pl-1" width={18} height={18} />
        <span class="break-words">{meta.filename}</span>
      </div>
    )
  }
  if (meta.type === 'url') {
    return (
      <a class="break-words underline" href={meta.src} target="_blank" rel="noreferrer">
        {decorateContent(meta.src)}
      </a>
    )
  }
  if (meta.type === 'search') {
    return (
      <div class="flex cursor-pointer items-center duration-150">
        <span>我:</span>
        <span class="break-words">{decorateContent(meta.question)}</span>
      </div>
    )
  }
  return null
}
