import { defaultModels } from '@lib/langchain';
import { loadLMMap } from '@lib/ai-sdk';
import { event } from '../../util';
export const models = {};
function initModels() {
    const config = defaultModels();
    const loaded = loadLMMap(config);
    for (const k of Object.keys(models))
        delete models[k];
    for (const [k, v] of Object.entries(loaded)) {
        models[k] = v;
    }
}
initModels();
event.on('updateModels', async (model) => {
    const loaded = loadLMMap(model);
    for (const k of Object.keys(models))
        delete models[k];
    for (const [k, v] of Object.entries(loaded)) {
        models[k] = v;
    }
});
