import CrossMarkRound from '@renderer/assets/icon/base/CrossMarkRound';
import { event } from '@renderer/lib/util';
import { createSignal, onCleanup, onMount, Show } from 'solid-js';
export const [findContent, setFindContent] = createSignal('');
export const [showSearch, setShowSearch] = createSignal(false);
export default function GlobalSearch() {
    onMount(() => {
        console.log('globalSearch');
        const globalSearch = () => {
            if (showSearch()) {
                setFindContent('');
            }
            else {
                const selection = window.getSelection();
                setFindContent(selection?.toString() || '');
            }
            setShowSearch(!showSearch());
        };
        event.on('globalSearch', globalSearch);
        onCleanup(() => {
            event.off('globalSearch', globalSearch);
        });
    });
    return (<Show when={showSearch()}>
      <div class="fixed right-8 top-24 z-20 flex animate-popup items-center gap-1">
        <input value={findContent()} onInput={(e) => {
            setFindContent(e.target.value);
        }} placeholder="输入搜索内容"/>
        <CrossMarkRound onClick={() => {
            setShowSearch(false);
            setFindContent('');
        }} width={28} height={28} class="cursor-pointer text-gray hover:text-active"/>
      </div>
    </Show>);
}
