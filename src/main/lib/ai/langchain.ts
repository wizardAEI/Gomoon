import { loadLMMap, msgDict } from '../../../lib/langchain'
import { getUserData, loadAppConfig } from '../../models'

function getLMConfig() {
  return {
    models: loadAppConfig().models,
    current: getUserData().selectedModel
  }
}

export async function lmInvoke(option: { system?: string; content: string }): Promise<string> {
  const lm = loadLMMap(getLMConfig().models)[getLMConfig().current]
  if (!lm) {
    throw new Error('no model')
  }
  const msgs = [msgDict['human'](option.content)]
  if (option.system) msgs.unshift(msgDict['system'](option.system))
  return (await lm.invoke(msgs)).content as string
}
