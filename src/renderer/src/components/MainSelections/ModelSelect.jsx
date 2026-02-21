import { setSelectedModel, userData } from '@renderer/store/user';
import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import { settingStore } from '@renderer/store/setting';
import { getModelInfo } from '@lib/langchain';
import ScrollBox from '../ScrollBox';
export function getModelOptions() {
    const enabled = settingStore.models.enabledModels;
    return enabled.map((em) => {
        const info = getModelInfo(em.id, enabled);
        return {
            label: <span class="max-w-32 truncate text-ellipsis">{info.label}</span>,
            value: em.id,
            maxToken: info.maxToken
        };
    });
}
export default function ModelSelect(props) {
    const options = createMemo(() => getModelOptions());
    const [isOpen, setIsOpen] = createSignal(false);
    const handleSelect = (option) => {
        setSelectedModel(option.value);
        setIsOpen(false);
    };
    const label = createMemo(() => {
        const enabled = settingStore.models.enabledModels;
        const info = getModelInfo(userData.selectedModel, enabled);
        const text = info?.label || userData.selectedModel || '选择模型';
        const isPlaceholder = !userData.selectedModel || !enabled.some((m) => m.id === userData.selectedModel);
        return (<span class={`max-w-32 truncate text-ellipsis ${isPlaceholder ? 'text-text2' : ''}`}>{text}</span>);
    });
    const selected = (option) => {
        return userData.selectedModel === option.value;
    };
    return (<div class="relative flex">
      <div ref={(el) => {
            const container = el.parentElement;
            if (!container)
                return;
            const fn = (e) => {
                const target = e.target;
                if (!target)
                    return;
                if (container.contains(target)) {
                    if (el.contains(target)) {
                        setIsOpen((i) => !i);
                    }
                    return;
                }
                setIsOpen(false);
            };
            document.addEventListener('click', fn);
            onCleanup(() => document.removeEventListener('click', fn));
        }} class={`flex cursor-pointer items-center ${isOpen() ? 'relative z-[11]' : ''}`}>
        {label()}
      </div>
      <Show when={isOpen()}>
        <div class={`absolute top-full z-10 mt-2 flex flex-col rounded-md bg-dark-plus px-1 shadow-center ${props.position} ${props.translate || ''} h-[278px] w-60`}>
          <ScrollBox>
            <div class="w-full px-1">
              <div class="mt-2 h-1"/>
              <For each={options()}>
                {(option) => (<div class={`mb-1 w-full cursor-pointer break-words rounded-lg py-1 pl-2 ${selected(option) ? 'bg-active' : ''} duration-100 hover:bg-active hover:text-text-active
                `} onClick={() => handleSelect(option)}>
                    <div class={`flex items-center justify-between pr-2 ${selected(option) && 'text-text-active'}`}>
                      <div class="flex select-none min-w-0 flex-1 truncate">
                        {option.label}
                      </div>
                      <Show when={option.maxToken} fallback={'🧩 🧩'}>{`${(option.maxToken / 1000).toFixed(0)} K`}</Show>
                    </div>
                  </div>)}
              </For>
              <div class="mb-1 h-1"/>
            </div>
          </ScrollBox>
        </div>
      </Show>
    </div>);
}
