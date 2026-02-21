import MarkdownIt from 'markdown-it';
export declare function getMd(isGenerating?: boolean, options?: {
    showHtml?: boolean;
}): MarkdownIt;
export default function Md(props: {
    class: string;
    content: string;
    onSpeak?: (c: string) => void;
    needSelectBtn?: boolean;
    isGenerating?: boolean;
    showHtml?: boolean;
}): import("solid-js").JSX.Element;
export declare function mdToText(content: string): string;
