import { useNavigate } from '@solidjs/router'
import { memoCapsule } from '@renderer/store/input'
import { Show } from 'solid-js'
import { getCurrentMemo } from '@renderer/store/memo'
import { pageData } from '@renderer/store/user'
import PlayingIcon from '@renderer/assets/icon/base/PlayingIcon'
import CrossMarkRound from '@renderer/assets/icon/base/CrossMarkRound'
import { event } from '@renderer/lib/util'

import CapitalIcon from '../ui/CapitalIcon'
import ModelSelect from '../MainSelections/ModelSelect'

export default function (props: { type: 'chat' | 'ans'; botName: string }) {
  const nav = useNavigate()
  return (
    <div class="group/capsule fixed left-1/2 top-10 z-20 flex -translate-x-1/2 select-none items-center rounded-xl border-2 border-solid border-dark-con bg-dark-pro">
      <div
        onClick={() => {
          nav('/assistants?type=' + props.type)
        }}
        class="mx-[-2px] my-[-2px] flex cursor-pointer items-center gap-[2px] rounded-xl rounded-r-none border-2 border-solid border-transparent px-[6px] py-[2px] text-text2 hover:border-active hover:text-text1"
      >
        <CapitalIcon bg="bg-active-gradient" size={16} content={props.botName} />
        <span class="max-w-[120px] truncate text-sm">{props.botName}</span>
      </div>
      <Show when={memoCapsule()}>
        <div
          onClick={() => {
            nav('/memories?type=' + props.type)
          }}
          class="my-[-2px] ml-[-2px] flex h-7 cursor-pointer items-center gap-[2px] border-2 border-solid border-transparent px-1 text-text2 hover:border-active hover:text-text1"
        >
          <CapitalIcon bg="bg-green-gradient" size={16} content={getCurrentMemo().name} />
          <span class="max-w-[120px] truncate text-sm">{getCurrentMemo().name}</span>
        </div>
      </Show>
      <div class="relative my-[-2px] mr-[-2px] rounded-xl rounded-l-none border-2 border-solid border-transparent px-[6px] py-[3px] hover:border-active">
        <ModelSelect position="right-20" translate="translate-x-1/2" size={18} />
      </div>
      <Show when={pageData.isSpeech}>
        <div class="group/playing absolute -right-8 flex cursor-pointer items-center rounded-full bg-dark-pro">
          <PlayingIcon width={20} height={20} class="text-active group-hover/playing:opacity-0" />
          <CrossMarkRound
            width={22}
            height={22}
            onClick={() => {
              event.emit('stopSpeak')
            }}
            class="absolute -left-[1px] text-active opacity-0 group-hover/playing:opacity-100"
          />
        </div>
      </Show>
    </div>
  )
}
