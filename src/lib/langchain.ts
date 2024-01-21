export interface Models {
  OpenAI: {
    apiKey: string
    baseURL: string
    temperature: number
  }
  BaiduWenxin: {
    apiKey: string
    secretKey: string
    temperature: number
  }
  AliQWen: {
    apiKey: string
    temperature: number
  }
}
export interface SettingModel {
  isOnTop: boolean
  canMultiCopy: boolean
  quicklyWakeUpKeys: string
  sendWithCmdOrCtrl: boolean
  models: {
    OpenAI: {
      apiKey: string
      baseURL: string
      temperature: number
    }
    BaiduWenxin: {
      apiKey: string
      secretKey: string
      temperature: number
    }
    AliQWen: {
      apiKey: string
      temperature: number
    }
  }
}export type ModelsType = 'ERNIE3' |
  'ERNIE4' |
  'GPT3' |
  'GPT4' |
  'QWenTurbo' |
  'QWenPlus' |
  'QWenMax'

