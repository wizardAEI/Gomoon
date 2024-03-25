import { msgDict } from '../../../lib/langchain'
import { loadLMMapForNode } from '../../../lib/utils'
import { getUserData, loadAppConfig } from '../../models'

function getLMConfig() {
  return {
    models: loadAppConfig().models,
    current: getUserData().selectedModel
  }
}

export async function lmInvoke(option: { system?: string; content: string }): Promise<string> {
  const lm = (await loadLMMapForNode(getLMConfig().models))[getLMConfig().current]
  if (!lm) {
    throw new Error('llm not found')
  }
  const msgs = [msgDict['human'](option.content)]
  if (option.system) msgs.unshift(msgDict['system'](option.system))
  try {
    const res = await lm.invoke(msgs)
    return res.content as string
  } catch (e) {
    throw new Error('llm error')
  }
}
