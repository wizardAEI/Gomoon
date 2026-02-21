import { Roles } from '@renderer/lib/ai/langchain';
export interface Msg {
    id: string;
    role: Roles;
    content: string;
}
export interface MsgMeta {
    id: string;
}
export declare const msgMeta: MsgMeta, setMsgMeta: import("solid-js/store").SetStoreFunction<MsgMeta>;
declare const msgs: Msg[], setMsgs: import("solid-js/store").SetStoreFunction<Msg[]>;
export declare function pushMsg(msg: Msg): void;
export declare function clearMsgs(): void;
export declare function removeMsg(id: string): void;
export declare function restoreMsgs(): void;
export declare function editMsg(msg: Partial<Msg>, id: string): void;
export declare function editMsgByAdd(content: string, id: string): void;
declare const msgStatus: {
    generatingList: string[];
};
export declare function pushGeneratingStatus(existID?: string): string;
export declare function removeGeneratingStatus(id: string): void;
export declare function isGenerating(id: string): boolean;
export declare function reActiveGeneratingStatus(id: string): void;
export declare function genMsg(id: string): Promise<void>;
export declare function stopGenMsg(id: string): Promise<void>;
export { msgs, setMsgs, msgStatus };
