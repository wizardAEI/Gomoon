import { useNavigate } from '@solidjs/router'
import ModelSelect from '../ModelSelect'
import CapitalIcon from '../ui/CapitalIcon'

export default function (props: { type: 'chat' | 'ans'; botName: string }) {
  const nav = useNavigate()
  return (
    <div class="group/capsule fixed left-1/2 top-12 z-50 flex -translate-x-1/2 select-none items-center rounded-xl bg-dark-pro">
      <div
        onClick={() => {
          nav('/assistants?type=' + props.type)
        }}
        class="flex cursor-pointer items-center gap-1 rounded-xl rounded-r-none border-r-0 border-solid border-dark-con px-[6px] py-[2px] text-text2 hover:border-active hover:text-text1"
      >
        <CapitalIcon size={16} content={props.botName || ''} />
        <span class="max-w-[160px] truncate text-sm">{props.botName}</span>
      </div>
      <div class="h-[27px] w-[2px] bg-dark-con group-hover/capsule:bg-active"> </div>
      <div class="relative rounded-xl rounded-l-none border-l-0 border-solid border-dark-con px-[6px] py-1 hover:border-active">
        <ModelSelect position="right-2" translate="translate-x-1/2" size={16} />
      </div>
    </div>
  )
}
