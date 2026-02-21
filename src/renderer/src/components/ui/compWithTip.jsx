import { Show, createSignal } from 'solid-js';
// FEAT: 让点击可以有反馈
export const compWithTip = (fn, position) => {
    const [tipModal, setTipModal] = createSignal({
        status: '',
        label: ''
    });
    const tip = (status, label) => {
        setTipModal({
            status,
            label
        });
        setTimeout(() => {
            setTipModal({
                status: '',
                label: ''
            });
        }, 1000);
    };
    const Comp = fn(tip);
    return (<div class={`relative flex overflow-visible ${position === 'right' ? 'justify-end' : 'justify-start'}`}>
      <Show when={tipModal().label}>
        {tipModal().status === 'success' && (<div class="absolute top-[-8px] -mx-4 h-1 animate-popup whitespace-nowrap text-text1">
            {tipModal().label || '成功!'}
          </div>)}
        {tipModal().status === 'fail' && (<div class="text-slate-50-mx-4 absolute top-[-8px] h-1 animate-popup whitespace-nowrap">
            {tipModal().label || '失败!'}
          </div>)}
      </Show>
      {Comp}
    </div>);
};
