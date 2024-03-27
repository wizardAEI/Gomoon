import { defaultModels } from '@lib/langchain'
import { loadLMMap } from '@lib/langchain'

import { event } from '../../util'

export const models = {
  ...(await loadLMMap(defaultModels()))
}

event.on('updateModels', async (model) => {
  const loadedModels = await loadLMMap(model)
  for (const key in models) {
    models[key] = loadedModels[key]
  }
})
