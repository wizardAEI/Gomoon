import { SettingFontFamily } from 'src/main/models/model'

export const themeOptions = [
  {
    label: 'Gomoon',
    value: 'gomoon-theme',
    slogan: '欢迎来到 Gomoon 月球基地'
  },
  {
    label: '白月光',
    value: 'light-theme',
    slogan: '月光的白，宁静护眼'
  }
]

export const fontFamilyOption: {
  label: string
  value: SettingFontFamily
}[] = [
  {
    label: '阿里方圆体',
    value: 'AlimamaFangyuan'
  },
  {
    label: '小米Sans体',
    value: 'MiSans'
  },
  {
    label: '默认字体',
    value: 'default'
  }
]
