import type { LanguageModelV3 } from '@ai-sdk/provider';
import type { LLMAdapter } from './types';
export interface AIAdapterSettings {
    temperature?: number;
}
export declare function createAIAdapter(model: LanguageModelV3, settings?: AIAdapterSettings): LLMAdapter;
