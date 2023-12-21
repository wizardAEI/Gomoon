import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentMetaData } from '@renderer/lib/ai/parseString'

export default function (meta: ContentMetaData) {
  if (meta.type === 'file') {
    return (
      <div
        onClick={() => {
          window.api.openPath(meta.src)
        }}
        class="text-text-dark2 flex cursor-pointer items-center gap-1 duration-150 hover:text-active"
      >
        <BaseFileIcon width={20} height={20} />
        <span>{meta.filename}</span>
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
