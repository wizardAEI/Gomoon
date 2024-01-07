import { SettingModel } from '../model'

export function getDefaultConfig(): SettingModel {
  return {
    isOnTop: false,
    models: {
      OpenAI: {
        apiKey: '',
        baseURL: '',
        temperature: 0.7
      },
      BaiduWenxin: {
        apiKey: '',
        secretKey: '',
        temperature: 0.7
      },
      AliQWen: {
        apiKey: '',
        temperature: 0.7
      }
    },
    canMultiCopy: true,
    quicklyWakeUpKeys: 'CmdOrCtrl+G',
    sendWithCmdOrCtrl: true
  }
}
