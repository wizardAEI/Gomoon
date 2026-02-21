import { Roles } from '@renderer/lib/ai/langchain';
import 'highlight.js/styles/atom-one-dark.css';
export type MsgTypes = Roles | 'ans' | 'question';
export declare const style: Record<MsgTypes, string>;
export declare const mdStyle: Record<MsgTypes, string>;
export default function Message(props: {
    type: MsgTypes;
    id?: string;
    content: string;
    botName?: string;
    editing?: boolean;
    isEmpty?: boolean;
    onRemove?: () => void;
}): import("solid-js").JSX.Element;
