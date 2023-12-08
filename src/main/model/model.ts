export interface SettingModel {
  isOnTop: boolean
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
  }
}

export type ModelsType = 'ERNIE3' | 'ERNIE4' | 'GPT3' | 'GPT4'

export interface UserData {
  firstTime: boolean
  selectedModel: ModelsType
}

export function getDefaultUserData(): UserData {
  return {
    firstTime: true,
    selectedModel: 'GPT4'
  }
}

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
      }
    }
  }
}
