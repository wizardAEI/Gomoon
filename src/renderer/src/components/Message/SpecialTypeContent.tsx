import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentMetaData } from '@renderer/lib/ai/parseString'
import Md from './Md'
import NetworkIcon from '@renderer/assets/icon/networkIcon'
import LinkIcon from '@renderer/assets/icon/LinkIcon'

export default function (meta: ContentMetaData, mdStyle: string) {
  if (meta.type === 'file') {
    return (
      <div
        onClick={() => {
          window.api.openPath(meta.src)
        }}
        class="flex cursor-pointer gap-1 break-words text-text-dark2 duration-150 hover:text-active"
      >
        <BaseFileIcon class="shrink-0 grow-0" width={20} height={20} />
        <span>{meta.filename}</span>
      </div>
    )
  }
  if (meta.type === 'url') {
    return (
      <div class="group/link flex gap-1">
        <LinkIcon
          class="shrink-0 grow-0 text-text-dark2 group-hover/link:text-active"
          width={16}
          height={16}
        />
        <a
          class="break-words text-text-dark2 underline group-hover/link:text-active"
          href={meta.src}
          target="_blank"
          rel="noreferrer"
        >
          {meta.src}
        </a>
      </div>
    )
  }
  if (meta.type === 'search') {
    return (
      <div class="flex gap-1">
        <NetworkIcon class="shrink-0 grow-0 text-text-dark2" width={20} height={20} />
        <Md class={mdStyle + ' markdown break-words text-text-dark2'} content={meta.question} />
      </div>
    )
  }
  return null
}
