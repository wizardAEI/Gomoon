import { event } from '../../util'
import { defaultModels } from '@lib/langchain'
import { loadLMMap } from '@lib/langchain'

export const models = {
  ...loadLMMap(defaultModels())
}

event.on('updateModels', (model) => {
  Object.keys(models).forEach((key: string) => {
    models[key] = loadLMMap(model)[key]
  })
})
