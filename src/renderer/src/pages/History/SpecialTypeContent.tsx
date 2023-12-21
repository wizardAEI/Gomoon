import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentMetaData } from '@renderer/lib/ai/parseString'

export default function (meta: ContentMetaData) {
  if (meta.type === 'file') {
    return (
      <div class="flex cursor-pointer items-center duration-150">
        <span>我:</span>
        <BaseFileIcon class="pl-1" width={18} height={18} />
        <span>{meta.filename}</span>
      </div>
    )
  }
  if (meta.type === 'url') {
    return (
      <a class="underline" href={meta.src} target="_blank" rel="noreferrer">
        {meta.src}
      </a>
    )
  }
  return null
}
