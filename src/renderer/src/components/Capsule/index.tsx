import { useNavigate } from '@solidjs/router'
import ModelSelect from '../MainSelections/ModelSelect'
import CapitalIcon from '../ui/CapitalIcon'
import { memoCapsule } from '@renderer/store/input'
import { Show } from 'solid-js'
import { getCurrentMemo } from '@renderer/store/memo'

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
            nav('/memo')
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
    </div>
  )
}
