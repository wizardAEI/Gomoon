import { JSXElement } from 'solid-js';
import { MsgTypes } from '.';
export declare function PopupContainer(props: {
    children: JSXElement;
    pos?: 'left' | 'right' | 'bottom-left';
}): import("solid-js").JSX.Element;
export declare function MsgPopupContents(props: {
    id: string;
    content: string;
    type: MsgTypes;
    onSpeak: () => void;
}): import("solid-js").JSX.Element;
export default function MsgPopup(props: {
    id: string;
    content: string;
    type: MsgTypes;
    onSpeak: () => void;
}): import("solid-js").JSX.Element;
export declare function MsgPopupForUser(props: {
    id: string;
    content: string;
    type: MsgTypes;
    onRemove: () => void;
}): import("solid-js").JSX.Element;
export declare function MsgPopupForSpecialContent(props: {
    type: MsgTypes;
    onRemove: () => void;
}): import("solid-js").JSX.Element;
export declare function WithDrawal(props: {
    type: MsgTypes;
}): import("solid-js").JSX.Element;
export declare function Pause(props: {
    id?: string;
    type: MsgTypes;
}): import("solid-js").JSX.Element;
