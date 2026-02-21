import MarkdownIt from 'markdown-it';
import { Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { useClipboard, useEventListener } from 'solidjs-use';
import mdHighlight from 'markdown-it-highlightjs';
import katex from '@vscode/markdown-it-katex';
import { full as emoji } from 'markdown-it-emoji';
import SpeechIcon from '@renderer/assets/icon/SpeechIcon';
import { load } from 'cheerio';
import { escape, escapeRegExp } from 'lodash';
import SearchIcon from '@renderer/assets/icon/base/SearchIcon';
import mermaid from 'mermaid';
import { ulid } from 'ulid';
import { findContent, setFindContent, showSearch } from './GlobalSearch';
function symbolConvert(str) {
    // 将常见的中文符号转为对应的英文符号，将@转为@#64
    // 定义需要编码的特殊字符
    const specialChars = /[@，。！？、（）【】《》￥”“‘’；：×÷(){}]/g;
    // 编码函数
    return str.replace(specialChars, (char) => `&#${char.charCodeAt(0)};`);
}
function customPostProcessor(md) {
    // latex_optimize 需要在 inline rule 之前，否则修改不会生效
    md.core.ruler.before('inline', 'latex_optimize', (state) => {
        const tokens = state.tokens;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'inline') {
                const contents = tokens[i].content.split('`');
                tokens[i].content = contents
                    .map((v, i) => {
                    if (i % 2 === 0 || i === contents.length - 1) {
                        return v
                            .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
                            .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
                    }
                    return v;
                })
                    .join('`');
                contents;
            }
        }
    });
}
export function getMd(isGenerating = false, options) {
    const { showHtml } = options || {};
    const md = MarkdownIt({
        html: showHtml,
        linkify: true,
        breaks: true
    })
        .use(customPostProcessor)
        .use(mdHighlight)
        .use(katex, {
        throwOnError: false
    })
        .use(emoji);
    // FEAT: 限制图片宽度
    md.renderer.rules.image = (tokens, idx) => {
        const token = tokens[idx];
        const srcIndex = token.attrIndex('src');
        const src = token.attrs[srcIndex][1];
        const alt = token.content || '';
        const style = `border-radius: 5px;`;
        return `<img src="${src}" alt="${alt}" class="md:max-w-2xl max-w-full" style="${style}" referrerpolicy="no-referrer"/>`;
    };
    const fence = md.renderer.rules.fence;
    md.renderer.rules.fence = (...args) => {
        const [tokens, idx] = args;
        const token = tokens[idx];
        const language = token.info.trim();
        const rawCode = fence(...args);
        if (language === 'mermaid' && !isGenerating) {
            const id = `mermaid-${ulid().slice(-5)}`;
            const render = () => {
                const element = document.getElementById(id);
                if (!element)
                    return;
                mermaid
                    .render('graphDiv' + ulid().slice(-5), symbolConvert(token.content), element)
                    .then(({ svg, bindFunctions }) => {
                    element.innerHTML = svg;
                    bindFunctions?.(element);
                })
                    .catch((e) => {
                    console.error('mermaid render error', e);
                    element.innerHTML = rawCode;
                });
            };
            setTimeout(render);
            return `<div id="${id}" class="overflow-auto">${rawCode}</div>`;
        }
        return rawCode;
    };
    return md;
}
export default function Md(props) {
    let selectContent = '';
    const [source] = createSignal('');
    const { copy, copied } = useClipboard({ source, copiedDuring: 1000 });
    const [showSelectBtn, setShowSelectBtn] = createSignal(false);
    let btn;
    function findText() {
        setFindContent(selectContent);
        setShowSelectBtn(false);
    }
    let contentDom;
    onMount(() => {
        // FEAT: 用户滑动选择文本
        const showButton = (e) => {
            const selection = window.getSelection();
            !showSearch() && setFindContent('');
            if (selection) {
                if (selection.toString().length > 0) {
                    setShowSelectBtn(true);
                    btn.style.top = `${e.clientY - 20}px`;
                    btn.style.left = `${e.clientX + 10}px`;
                    if (btn.offsetLeft + btn.clientWidth > window.innerWidth) {
                        btn.style.left = `${e.clientX - btn.clientWidth - 10}px`;
                        btn.style.top = `${e.clientY - 20}px`;
                    }
                    selectContent = selection.toString();
                }
                else {
                    setShowSelectBtn(false);
                }
            }
        };
        const hideButton = (e) => {
            const el = e.target;
            // 如果不是点击在contentDom上，则隐藏复制按钮
            if (!contentDom?.contains(el) && !btn?.contains(el)) {
                showSelectBtn() && setShowSelectBtn(false);
            }
        };
        contentDom?.addEventListener('mouseup', showButton);
        window.addEventListener('mouseup', hideButton);
        const handleKeydown = (e) => {
            if ((e.ctrlKey && e.key === 'c') || (e.metaKey && e.key === 'c')) {
                setShowSelectBtn(false);
            }
            if ((e.ctrlKey && e.key === 'f') || (e.metaKey && e.key === 'f')) {
                setShowSelectBtn(false);
            }
        };
        window.addEventListener('keydown', handleKeydown);
        onCleanup(() => {
            contentDom?.removeEventListener('mouseup', showButton);
            window.removeEventListener('mouseup', hideButton);
            window.removeEventListener('keydown', handleKeydown);
        });
    });
    const htmlString = createMemo(() => {
        const content = props.content;
        const md = getMd(props.isGenerating, {
            showHtml: props.showHtml
        });
        // FEAT: 复制功能
        useEventListener('click', (e) => {
            const el = e.target;
            let code = null;
            if (el.matches('div > div.copy-btn')) {
                code = decodeURIComponent(el.dataset.code);
                copy(code);
            }
            if (el.matches('div > div.copy-btn > svg')) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                code = decodeURIComponent(el.parentElement?.dataset.code);
                copy(code);
            }
            if (el.matches('div > div.copy-btn > div')) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                code = decodeURIComponent(el.parentElement?.dataset.code);
                copy(code);
            }
        });
        const fence = md.renderer.rules.fence;
        md.renderer.rules.fence = (...args) => {
            const [tokens, idx] = args;
            const token = tokens[idx];
            const language = token.info.trim();
            const rawCode = fence(...args);
            if (language === 'mermaid') {
                return rawCode;
            }
            return `<div class="relative mt-2 w-full text-text1">
          <div data-code=${encodeURIComponent(token.content)} class="cursor-pointer absolute top-1 right-1 z-10 hover:h-3 group/copy copy-btn">
              <svg xmlns="http://www.w3.org/2000/svg" class="group-hover/copy:text-active" width="1.1em" height="1.1em" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" /><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z" /></svg>
              <div class="absolute select-none -right-1 text-sm top-[14px] opacity-0 group-hover/copy:opacity-100 duration-300 text-text1 whitespace-nowrap">
                ${copied() ? '已复制' : '复制'}
              </div>
          </div>
          ${rawCode}
          </div>`;
        };
        const $ = load(`<div class="gomoon-md">${md.render(content)}</div>`);
        // FEAT: 对findContent高亮
        function highlightText(node) {
            if (!findContent())
                return;
            $(node)
                .contents()
                .each(function (_, elem) {
                if (elem.type === 'text') {
                    // 如果是文本节点，则替换文本
                    const text = $(elem).text();
                    // 检查是否有匹配
                    const regExp = new RegExp(escapeRegExp(findContent()), 'gi');
                    if (!regExp.test(text))
                        return;
                    const newText = text.replace(regExp, (match) => `<span class="bg-active rounded-sm">${escape(match)}</span>`);
                    $(elem).replaceWith(newText);
                }
                else if (elem.type === 'tag' &&
                    !['script', 'style', 'svg'].includes(elem.tagName.toLowerCase())) {
                    highlightText(elem);
                }
            });
        }
        highlightText($('.gomoon-md'));
        return $.html() || '';
    });
    return (<>
      <div ref={contentDom} class={props.class + ' markdown break-words'} 
    // eslint-disable-next-line solid/no-innerhtml
    innerHTML={htmlString()}/>
      <Show when={showSelectBtn() && props.needSelectBtn}>
        <div ref={btn} class="fixed flex gap-1 rounded-lg bg-dark-con px-1 py-[2px]">
          <SpeechIcon onClick={() => {
            props.onSpeak?.(selectContent);
            setShowSelectBtn(false);
        }} height={22} width={22} class="cursor-pointer text-gray duration-100 hover:text-active"/>
          <SearchIcon onClick={findText} height={20} width={20} class="cursor-pointer text-gray duration-100 hover:text-active"/>
        </div>
      </Show>
    </>);
}
export function mdToText(content) {
    const md = MarkdownIt({
        linkify: true,
        breaks: true
    })
        .use(mdHighlight)
        .use(katex)
        .use(emoji);
    return load(md.render(content)).text();
}
