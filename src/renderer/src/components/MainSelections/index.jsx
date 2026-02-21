import { useNavigate } from '@solidjs/router';
import { assistants, getCurrentAssistantForAnswer, getCurrentAssistantForChat } from '@renderer/store/assistants';
import { For, Show, createEffect, createSignal } from 'solid-js';
import { hasFirstTimeFor, setSelectedAssistantForAns, setSelectedAssistantForChat, setSelectedMemo, userData } from '@renderer/store/user';
import { getCurrentMemo, memories } from '@renderer/store/memo';
import { memoCapsule } from '@renderer/store/input';
import BotIcon from '../ui/BotIcon';
import Md from '../Message/Md';
import ModelSelect from './ModelSelect';
export default function (props) {
    const nav = useNavigate();
    const currentA = props.type === 'ans' ? getCurrentAssistantForAnswer : getCurrentAssistantForChat;
    const setSelected = props.type === 'ans' ? setSelectedAssistantForAns : setSelectedAssistantForChat;
    const [modelList, setModelList] = createSignal([]);
    const [memoList, setMemoList] = createSignal([]);
    createEffect((b) => {
        if (!assistants.length || b)
            return b;
        setModelList(assistants.filter((a) => a.type === props.type).slice(0, 5));
        setMemoList(memories.slice(0, 5));
        return true;
    }, false);
    // memories 可能为空（初始化之前）
    createEffect((b) => {
        if (!memories.length || b)
            return b;
        setMemoList(memories.slice(0, 5));
        return true;
    }, false);
    return (<div class={'relative mx-4 text-text1 ' + (props.type === 'ans' ? 'mt-4' : 'mt-8')}>
      <div class="relative mx-auto flex max-w-4xl items-center justify-center gap-2 rounded-2xl bg-dark p-4">
        <BotIcon size={20} seed={currentA().avatar || currentA().id.slice(-5)}/>
        <span class="select-none text-base">{currentA().name}</span>
        <Show when={userData.firstTimeFor.modelSelect}>
          <div class="absolute bottom-[6px] right-8 animate-bounce select-none text-[12px]">
            点击图标可以切换模型 👉
          </div>
        </Show>

        <div class="absolute bottom-2 right-2" onClick={() => {
            if (userData.firstTimeFor.modelSelect) {
                hasFirstTimeFor('modelSelect');
            }
        }}>
          <ModelSelect size={20} position="right-0"/>
        </div>
      </div>
      <div class="mt-10 flex select-none flex-wrap justify-center gap-2 px-3">
        <For each={modelList()}>
          {(a) => (<div onClick={async () => {
                setSelected(a.id);
            }} class={'flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-solid bg-dark px-4 py-1 hover:border-active ' +
                (a.id === currentA().id ? 'border-active' : 'border-transparent')}>
              <BotIcon size={16} seed={a.avatar || a.id.slice(-5)}/>
              <span class="text-text1 ">{a.name}</span>
            </div>)}
        </For>
        <div class="flex cursor-pointer items-center justify-center rounded-md border-2 border-solid border-transparent bg-dark px-4 py-1 hover:border-active " onClick={() => {
            nav('/assistants?type=' + props.type);
        }}>
          <span class="text-text1 ">更多助手...</span>
        </div>
      </div>
      <div>
        <Show when={currentA().introduce}>
          <div class="mx-auto mt-4 max-w-4xl gap-2 p-6">
            <div class="flex items-center justify-center rounded-md bg-dark p-4">
              <Md class="text-sm" content={currentA().introduce || ''}/>
            </div>
          </div>
        </Show>
      </div>
      <Show when={memoCapsule()}>
        <div class="mt-6 flex select-none flex-wrap justify-center gap-2 px-3">
          <For each={memoList()}>
            {(m) => (<div onClick={async () => {
                setSelectedMemo(m.id);
            }} class={'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-solid bg-dark px-4 py-1 hover:border-active ' +
                (m.id === getCurrentMemo().id ? 'border-active' : 'border-transparent')}>
                <span class="text-text1 ">{m.name}</span>
              </div>)}
          </For>
          <div class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-solid border-transparent bg-dark px-4 py-1 hover:border-active " onClick={() => {
            nav('/memories?type=' + props.type);
        }}>
            <span class="text-text1 ">更多记忆...</span>
          </div>
        </div>
      </Show>
    </div>);
}
