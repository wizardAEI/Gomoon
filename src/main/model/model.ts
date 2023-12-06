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

export interface UserData {
  firstTime: boolean
}

export function getDefaultUserData(): UserData {
  return {
    firstTime: true
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
