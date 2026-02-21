/**
 * AI-SDK adapter layer - unified LLM interface
 * All models use OpenAI-compatible API (apiKey + baseURL)
 */
export type { LLMAdapter, ChatMessage, MessageContent, Roles, GenerateResult } from './types';
export { toAISDKMessages } from './messages';
export { createAIAdapter } from './adapter';
export { loadAIProviders } from './providers';
import type { ModelsConfig } from '../models-config';
import type { LLMAdapter } from './types';
/** Load LLM adapter map - Record<EnabledModel.id, LLMAdapter> */
export declare function loadLMMap(model: ModelsConfig): Record<string, LLMAdapter>;
