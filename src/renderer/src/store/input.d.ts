export declare function setNetworkingStatus(status: boolean): void;
export declare const isNetworking: import("solid-js").Accessor<boolean>;
export declare const memoCapsule: import("solid-js").Accessor<boolean>;
export declare function setMemoCapsule(status: boolean): void;
export declare function setInputText(text: string): void;
export declare const inputText: import("solid-js").Accessor<string>;
export declare const tokens: import("solid-js").Accessor<{
    maxToken: string | number;
    consumedTokenForChat: (plusNum: number) => string | number;
    consumedTokenForAns: (plusNum: number) => string | number;
}>;
export declare const consumedToken: import("solid-js").Accessor<{
    ans: number;
    chat: number;
}>;
export declare function setConsumedTokenForChat(token: number): void;
export declare function setConsumedTokenForAns(token: number): void;
