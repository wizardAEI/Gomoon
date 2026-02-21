/**
 * Message format conversion: ChatMessage (langchain compatible) <-> AI-SDK CoreMessage
 */
import type { ChatMessage } from './types';
/** AI-SDK message format */
export type AIMessage = {
    role: 'system';
    content: string;
} | {
    role: 'user';
    content: string | Array<{
        type: 'text';
        text: string;
    } | {
        type: 'image';
        image: string | URL;
        mimeType?: string;
    }>;
} | {
    role: 'assistant';
    content: string;
};
export declare function toAISDKMessages(messages: ChatMessage[]): AIMessage[];
