import EmptyIcon from '@renderer/assets/icon/base/EmptyIcon';
import Md from '@renderer/components/Message/Md';
import { parseDisplayArr } from '@renderer/lib/ai/parseString';
import { collections, removeCollection, StickTop, updateCollection, witchToChat } from '@renderer/store/collection';
import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import DoubleConfirm from '@renderer/components/ui/DoubleConfirm';
import { useToast } from '@renderer/components/ui/Toast';
import WarningIcon from '@renderer/assets/icon/base/Toast/WarningIcon';
import UpwardArrow from '@renderer/assets/icon/base/arrow/UpwardArrow';
import DownwardArrow from '@renderer/assets/icon/base/arrow/DownwardArrow';
import MoreHIcon from '@renderer/assets/icon/base/MoreHIcon';
import TrashIcon from '@renderer/assets/icon/TrashIcon';
import Button from '@renderer/components/ui/Button';
import ChatIcon from '@renderer/assets/icon/ChatIcon';
import StickTopIcon from '@renderer/assets/icon/base/StickTopIcon';
import { useNavigate } from '@solidjs/router';
import SpecialTypeContent from './SpecialTypeContent';
import { decorateContent } from './utils';
const map = {
    human: '我：',
    ai: '助手：',
    question: '问题：',
    ans: '答案：',
    system: '系统：'
};
const iconClass = [
    'group/btn flex cursor-pointer items-center rounded-md p-[2px] duration-100 hover:bg-gray/20',
    'text-gray group-hover/btn:text-active'
];
export default function Collection(props) {
    const toast = useToast();
    const nav = useNavigate();
    const filteredCollections = createMemo(() => {
        return collections.filter((c) => c.name.includes(props.searchText));
    });
    return (<div class="w-full px-1 lg:max-w-4xl">
      <Show when={collections.length} fallback={<div class="relative m-auto flex h-40 w-full select-none flex-col items-center justify-center gap-3 rounded-2xl bg-dark p-5 duration-150">
            <EmptyIcon height={50} class="text-gray"/>
            <span class="text-sm text-gray">暂无合集</span>
          </div>}>
        <For each={filteredCollections()}>
          {(c, i) => {
            const [expandAll, setCanExpandAll] = createSignal(collections.length === i() + 1 || collections.length < 5);
            const [showMore, setShowMore] = createSignal(false);
            return (<div class="my-3">
                <div class={`relative flex w-full items-center  bg-dark-plus px-2 pb-1 pt-[6px] ${showMore() ? 'z-10' : ''} ${expandAll() ? 'rounded-t-lg' : 'rounded-lg'}`}>
                  <div class="flex gap-1">
                    <span class="text-base">{c.name}</span>
                    <div class="flex cursor-pointer items-center gap-[2px] pl-2 text-gray hover:fill-active hover:text-active" onClick={() => setCanExpandAll(!expandAll())}>
                      {expandAll() ? (<>
                          <UpwardArrow height={14} width={14}/>
                          收起所有
                        </>) : (<>
                          <DownwardArrow height={14} width={14}/>
                          展开所有
                        </>)}
                    </div>
                  </div>
                  <div class="absolute right-2 top-[5px]">
                    <Show when={showMore()} fallback={<div class={iconClass[0]} onClick={() => setShowMore(true)}>
                          <MoreHIcon width={20} height={20} class={iconClass[1]}/>
                        </div>}>
                      <div ref={(el) => {
                    const fn = (e) => {
                        if (e.target && el.contains(e.target)) {
                            e.stopPropagation();
                            return;
                        }
                        setShowMore(false);
                    };
                    document.addEventListener('click', fn);
                    onCleanup(() => {
                        document.removeEventListener('click', fn);
                    });
                }} onClick={() => {
                    StickTop(c.id);
                }} class="flex flex-col gap-1 rounded-md bg-dark px-2 py-1 shadow-center">
                        <div class={iconClass[0]}>
                          <StickTopIcon height={20} width={20} class={iconClass[1]}/>
                          <span class={iconClass[1]}>置顶当前集合</span>
                        </div>
                        <div class={iconClass[0]} onClick={() => {
                    toast
                        .confirm(<div class="flex items-center gap-1">
                                  <WarningIcon width={24} height={24} class="text-warning"/>
                                  确定删除合集所有内容吗？
                                </div>, {
                        mask: true
                    })
                        .then((res) => {
                        if (res) {
                            removeCollection(c.id);
                        }
                    });
                }}>
                          <TrashIcon height={20} width={20} class="text-danger group-hover/btn:text-active"/>
                          <span class="text-danger group-hover/btn:text-active">删除所有内容</span>
                        </div>
                      </div>
                    </Show>
                  </div>
                </div>
                <Show when={expandAll()}>
                  <div class="mb-2 flex flex-col rounded-b-lg bg-dark px-2 py-1">
                    <For each={c.contents}>
                      {(cons, index) => {
                    const [canExpand, setCanExpand] = createSignal(false);
                    const [expand, setExpand] = createSignal(false);
                    const [showCardMore, setShowCardMore] = createSignal(false);
                    return (<div class="relative mb-2 rounded-md border border-dashed border-gray p-1">
                            <div class="absolute right-2 top-1 z-20">
                              <Show when={showCardMore()} fallback={<div class={iconClass[0]} onClick={() => setShowCardMore(true)}>
                                    <MoreHIcon width={20} height={20} class={iconClass[1]}/>
                                  </div>}>
                                <div>
                                  <div ref={(el) => {
                            const fn = (e) => {
                                if (e.target && el.contains(e.target)) {
                                    e.stopPropagation();
                                    return;
                                }
                                setShowCardMore(false);
                            };
                            document.addEventListener('click', fn);
                            onCleanup(() => {
                                document.removeEventListener('click', fn);
                            });
                        }} class="flex flex-col gap-1 rounded-md bg-dark px-2 py-1 shadow-center">
                                    <div class={iconClass[0]} onClick={() => {
                            witchToChat(cons);
                            if (cons[0].type === 'ans') {
                                nav('/ans');
                            }
                            else {
                                nav('/chat');
                            }
                        }}>
                                      <ChatIcon height={18} width={18} class={iconClass[1]}/>{' '}
                                      <span class={iconClass[1]}>转到对话</span>
                                    </div>
                                    <DoubleConfirm label="确认删除" position="-right-2 top-3" onConfirm={() => {
                            updateCollection(c.id, index());
                        }}>
                                      <div class={iconClass[0]}>
                                        <TrashIcon height={18} width={18} class="text-danger group-hover/btn:text-active"/>{' '}
                                        <span class="text-danger group-hover/btn:text-active">
                                          删除卡片
                                        </span>
                                      </div>
                                    </DoubleConfirm>
                                  </div>
                                </div>
                              </Show>
                            </div>
                            <Show when={canExpand() && !expand()}>
                              <div onClick={() => {
                            setExpand(true);
                        }} class="absolute bottom-0 left-0 right-0 top-0 z-10 flex cursor-pointer items-center justify-center bg-dark/60 text-sm text-active opacity-0 duration-200 hover:opacity-100">
                                查看全部
                              </div>
                            </Show>
                            <For each={cons}>
                              {(con) => {
                            const meta = parseDisplayArr(con.content);
                            return (<For each={meta}>
                                    {(m, index) => {
                                    if ((m.type === 'text' && m.content.length > 200) ||
                                        ((m.type === 'search' || m.type === 'memo') &&
                                            m.question.length > 200)) {
                                        setCanExpand(true);
                                    }
                                    return (<div class="select-text">
                                          {index() === 0 && (<div class="mb-1 font-bold">{map[con.role]}</div>)}
                                          {m.type === 'text' ? (<Md class="text-sm" content={expand()
                                                ? m.content
                                                : decorateContent(m.content, 200)}/>) : (SpecialTypeContent(m, 200, expand() ? true : false))}
                                        </div>);
                                }}
                                  </For>);
                        }}
                            </For>
                            <Show when={expand()}>
                              <Button class="w-full" onClick={() => {
                            setExpand(!expand());
                        }}>
                                收起
                              </Button>
                            </Show>
                          </div>);
                }}
                    </For>
                  </div>
                </Show>
              </div>);
        }}
        </For>
      </Show>
    </div>);
}
