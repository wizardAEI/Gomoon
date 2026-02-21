/**
 * 直接调用 /chat/completions 接口进行流式生成
 * 适用于 OpenAI 兼容的 API
 */
import type { ChatMessage, GenerateResult } from './types';
export interface ChatCompletionsOptions {
    baseURL: string;
    apiKey: string;
    modelId: string;
    temperature?: number;
    signal?: AbortSignal;
}
export interface StreamOptions {
    onToken?: (token: string) => void;
    onEnd?: (output: GenerateResult) => void;
    onError?: (err: unknown) => void;
}
/**
 * 流式调用 POST {baseURL}/chat/completions
 */
export declare function streamChatCompletions(messages: ChatMessage[], options: ChatCompletionsOptions & StreamOptions): Promise<GenerateResult | null>;
/**
 * 非流式调用 POST {baseURL}/chat/completions
 */
export declare function chatCompletions(messages: ChatMessage[], options: ChatCompletionsOptions): Promise<GenerateResult>;
