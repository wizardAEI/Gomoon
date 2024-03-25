import { event } from '../../util'
import { defaultModels } from '@lib/langchain'
import { loadLMMap } from '@lib/langchain'

export const models = {
  ...(await loadLMMap(defaultModels()))
}

event.on('updateModels', async (model) => {
  const loadedModels = await loadLMMap(model)
  for (const key in models) {
    models[key] = loadedModels[key]
  }
})
