import { useNavigate } from '@solidjs/router'
import ModelSelect from '../ModelSelect'
import CapitalIcon from '../ui/CapitalIcon'

export default function (props: { type: 'chat' | 'ans'; botName: string }) {
  const nav = useNavigate()
  return (
    <div class="group/capsule fixed left-1/2 top-10 z-20 flex -translate-x-1/2 select-none items-center rounded-xl bg-dark-pro">
      <div
        onClick={() => {
          nav('/assistants?type=' + props.type)
        }}
        class=" flex cursor-pointer items-center gap-1 rounded-xl rounded-r-none border-2 border-r-0 border-solid border-dark-plus px-[6px] py-[2px] text-text2 hover:border-active hover:text-text1"
      >
        <CapitalIcon size={16} content={props.botName || ''} />
        <span class="max-w-[160px] truncate text-sm">{props.botName}</span>
      </div>
      <div class="h-7 w-[2px] bg-dark-plus group-hover/capsule:bg-active"> </div>
      <div class="relative rounded-xl rounded-l-none border-2 border-l-0 border-solid border-dark-plus px-[6px] py-[3px] hover:border-active">
        <ModelSelect position="right-20" translate="translate-x-1/2" size={18} />
      </div>
    </div>
  )
}
