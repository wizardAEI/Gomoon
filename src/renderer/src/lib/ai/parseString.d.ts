import type { MessageContent } from '@lib/ai-sdk';
declare const regDict: {
    readonly regForFile: RegExp;
    readonly regForUrl: RegExp;
    readonly regForSearch: RegExp;
    readonly regForMemo: RegExp;
    readonly regForQuestion: RegExp;
    readonly regForVal: RegExp;
    readonly regForImage: RegExp;
    readonly regForDrawer: RegExp;
};
export declare function parseString(str: string, isLastMsg?: boolean): {
    type: keyof typeof regDict | "text";
    src?: string;
    filename?: string;
    display?: string;
    value: string;
}[];
export declare function extractMeta(str: string, isLastMsg?: boolean): MessageContent;
export type ContentDisplay = {
    type: 'file';
    src: string;
    filename: string;
} | {
    type: 'url';
    src: string;
} | {
    type: 'text';
    content: string;
} | {
    type: 'search';
    question: string;
} | {
    type: 'memo';
    question: string;
} | {
    type: 'image';
    src: string;
    filename: string;
    value: string;
};
export declare function parseDisplayArr(str: string): ContentDisplay[];
export {};
