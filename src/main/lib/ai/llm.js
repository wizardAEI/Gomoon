/**
 * Node-only LLM loader - main process uses same loadLMMap as renderer
 */
import { loadLMMap } from '../../../lib/ai-sdk';
export async function loadLMMapForNode(model) {
    return loadLMMap(model);
}
