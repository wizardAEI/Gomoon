import type { ModelsConfig } from '../../../lib/models-config';
import type { LLMAdapter } from '../../../lib/ai-sdk';
export declare function loadLMMapForNode(model: ModelsConfig): Promise<Record<string, LLMAdapter>>;
