import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentMetaData } from '@renderer/lib/ai/parseString'

export default function (meta: ContentMetaData) {
  if (meta.type === 'file') {
    const filename = meta.src.split('/').pop()!
    return (
      <div class="flex cursor-pointer items-center gap-1 text-text-dark duration-150 hover:text-active">
        <BaseFileIcon width={20} height={20} />
        <span>{filename}</span>
      </div>
    )
  }
  if (meta.type === 'url') {
    return (
      <a
        class="text-text1 underline hover:text-active"
        href={meta.src}
        target="_blank"
        rel="noreferrer"
      >
        {meta.src}
      </a>
    )
  }
  return null
}
