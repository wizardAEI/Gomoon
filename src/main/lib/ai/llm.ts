/**
 * Node-only LLM loader - main process uses same loadLMMap as renderer
 */
import { loadLMMap } from '../../../lib/ai-sdk'
import type { ModelsConfig } from '../../../lib/models-config'
import type { LLMAdapter } from '../../../lib/ai-sdk'

export async function loadLMMapForNode(
  model: ModelsConfig
): Promise<Record<string, LLMAdapter>> {
  return loadLMMap(model)
}
