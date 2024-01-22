import { getUserData, loadAppConfig } from '../models'

export function getLMConfig() {
  return {
    models: loadAppConfig().models,
    current: getUserData().selectedModel
  }
}
