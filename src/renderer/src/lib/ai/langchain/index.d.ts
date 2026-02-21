import type { MessageContent, GenerateResult } from '@lib/ai-sdk';
export type Roles = 'human' | 'system' | 'ai';
/**
 * FEAT: Answer Assistant
 */
export declare const ansAssistant: (option: {
    question: MessageContent;
    newTokenCallback: (content: string) => void;
    endCallback?: (result: GenerateResult) => void;
    errorCallback?: (err: unknown) => void;
    pauseSignal: AbortSignal;
}) => Promise<GenerateResult | null>;
/**
 * FEAT: Chat Assistant
 */
export declare const chatAssistant: (msgs: {
    role: Roles;
    content: MessageContent;
}[], option: {
    newTokenCallback: (content: string) => void;
    endCallback?: (result: GenerateResult) => void;
    errorCallback?: (err: unknown) => void;
    pauseSignal: AbortSignal;
}) => Promise<GenerateResult | null>;
export declare const nonStreamingAssistant: (question: string) => Promise<{
    content: string;
}>;
