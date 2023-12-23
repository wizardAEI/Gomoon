import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentMetaData } from '@renderer/lib/ai/parseString'
import { decorateContent } from './utils'
import NetworkIcon from '@renderer/assets/icon/networkIcon'

export default function (meta: ContentMetaData) {
  if (meta.type === 'file') {
    return (
      <div class="flex cursor-pointer items-center overflow-hidden">
       <span class='mr-1'>我:</span> 
        <BaseFileIcon class="text-text2 grow-0 shrink-0" width={18} height={18} />
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
        <span class="flex items-start break-words">
         <span class='mr-1'>我:</span> 
          <NetworkIcon
          class="text-text2 grow-0 shrink-0 translate-y-[1px]" width={18} height={18} />
          <span class="text-text2">{decorateContent(meta.question)}</span>
        </span>
      </div>
    )
  }
  return null
}
