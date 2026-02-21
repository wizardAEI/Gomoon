export interface CallLLmOption {
    llm: string;
    modelName?: string;
    msgs: {
        role: 'human' | 'system' | 'ai';
        content: string;
    }[];
    type: 'ans' | 'chat';
}
export declare function callLLM(options: CallLLmOption): Promise<void>;
export declare function stopLLM(): Promise<void>;
export declare function lmInvoke(option: {
    system?: string;
    content: string;
}): Promise<string>;
