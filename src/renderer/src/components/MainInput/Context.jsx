export default function ContextContainer(props) {
    return (<div class="border-border flex w-36 flex-col gap-1 rounded-md border border-solid bg-dark-con px-4 py-3 opacity-95">
      <div class={`${props.selected ? 'cursor-pointer hover:text-active' : 'text-disabled cursor-not-allowed text-gray'}`} onMouseDown={() => {
            console.log('click');
            props.selected && props.onClick?.('copy');
        }}>
        复制
      </div>
      <div class={`${props.selected ? 'cursor-pointer hover:text-active' : 'text-disabled cursor-not-allowed text-gray'}`} onMouseDown={() => {
            props.selected && props.onClick?.('cut');
        }}>
        剪切
      </div>
      <div class="cursor-pointer hover:text-active" onMouseDown={() => {
            props.onClick?.('paste');
        }}>
        粘贴
      </div>
      <div class="cursor-pointer hover:text-active" onMouseDown={() => {
            props.onClick?.('select-all');
        }}>
        全选内容
      </div>
      <div class="cursor-pointer hover:text-active" onMouseDown={() => {
            props.onClick?.('clear');
        }}>
        清空输入框
      </div>
      <div class="my-1 h-[1px] bg-gray px-2"/>
      <div class={`${props.generating ? 'text-disabled cursor-not-allowed text-gray' : 'cursor-pointer  hover:text-active'}`} onMouseDown={() => {
            !props.generating && props.onClick?.('new-chat');
        }}>
        开启一段新对话
      </div>
      <div class="cursor-pointer hover:text-active" onMouseDown={() => {
            props.onClick?.('switch');
        }}>
        {props.type === 'ans' || props.type === 'question' ? '切换到连续对话' : '切换到问答'}
      </div>
    </div>);
}
