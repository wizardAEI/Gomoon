/* eslint-disable solid/components-return-once */
import BaseFileIcon from '@renderer/assets/icon/file/baseFileIcon'
import { ContentDisplay } from '@renderer/lib/ai/parseString'
import NetworkIcon from '@renderer/assets/icon/BrowserIcon'
import LinkIcon from '@renderer/assets/icon/LinkIcon'
import CapsuleIcon from '@renderer/assets/icon/CapsuleIcon'

import Md from './Md'

export default function (meta: ContentDisplay, mdStyle: string) {
  if (meta.type === 'file') {
    return (
      <div
        onClick={() => window.api.openPath(meta.src)}
        class="flex cursor-pointer gap-1 py-[2px] text-text-dark2 duration-150 hover:text-active"
      >
        <BaseFileIcon class="shrink-0 grow-0" width={20} height={20} />
        <span class="truncate">{meta.filename}</span>
      </div>
    )
  }
  if (meta.type === 'url') {
    return (
      <span class="group/link flex gap-1 py-[2px]">
        <LinkIcon
          class="shrink-0 grow-0 text-text-dark2 group-hover/link:text-active"
          width={16}
          height={16}
        />
        <a
          class="flex-1 truncate text-text-dark2 underline group-hover/link:text-active"
          href={meta.src}
          target="_blank"
          rel="noreferrer"
        >
          {meta.src}
        </a>
      </span>
    )
  }
  if (meta.type === 'search') {
    return (
      <div class="flex gap-1 py-[2px]">
        <NetworkIcon class="shrink-0 grow-0 text-text-dark2" width={20} height={20} />
        <Md class={mdStyle + ' text-text-dark2'} content={meta.question} />
      </div>
    )
  }
  if (meta.type === 'memo') {
    return (
      <div class="flex gap-1 py-[2px]">
        <CapsuleIcon class="shrink-0 grow-0 text-text-dark2" width={18} height={18} />
        <Md class={mdStyle + ' text-text-dark2'} content={meta.question} />
      </div>
    )
  }
  if (meta.type === 'image') {
    return (
      <div class="w-[100%] cursor-pointer" onClick={() => window.api.openPath(meta.src)}>
        <img src={meta.val} alt="" width="100%" class="rounded-md" />
      </div>
    )
  }
  return null
}
