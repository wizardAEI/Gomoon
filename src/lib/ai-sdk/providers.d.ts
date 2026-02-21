/**
 * AI-SDK provider - unified OpenAI format
 * 使用 /chat/completions 接口进行流式与非流式调用
 */
import type { ModelsConfig } from '../models-config';
import type { LLMAdapter } from './types';
/** Load AI-SDK models from enabledModels + providers (all OpenAI-compatible) */
export declare function loadAIProviders(model: ModelsConfig): Record<string, LLMAdapter>;
