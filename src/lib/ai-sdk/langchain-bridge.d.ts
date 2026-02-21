import type { LLMAdapter } from './types';
type LangChainModel = {
    invoke: (msgs: any[], opts?: any) => Promise<any>;
    stream?: (msgs: any[], opts?: any) => AsyncIterable<any>;
};
export declare function createLangChainBridge(lcModel: LangChainModel): LLMAdapter;
export {};
