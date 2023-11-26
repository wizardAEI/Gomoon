/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      PingFangRegular: ['PingFang-SC-Regular'],
      PingFangMedium: ['PingFang-SC-Medium'],
      PingFangSCMedium: ['PingFangSC-Medium']
    },
    extend: {
      backgroundImage: {
        active: 'linear-gradient(145deg, #585892, #4a4a7a);', // 激活色渐变色 亮紫色
        purple: 'linear-gradient(to bottom right, #ae79f1, #9366cb)' // 淡紫色渐变色
      },
      colors: {
        home: '#475164', // 首页背景色 鲸鱼灰
        gray: '#a7a8bd', // 非激活色 淡紫灰色
        active: '#A57BEA', // 激活色 亮紫色
        dark: '#2d2e36', // 暗色 牛角灰
        light: '#f1f0ed', // 亮色 银白色
        'white/70': '#ffffff70' // 白色透明度70%
      },
      keyframes: {
        click: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
          '50%': { transform: 'scale(0.95) translateY(1px)' },
          '80%': { transform: 'scale(0.95) translateY(1px)' },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        click: 'click 0.2s ease-in-out'
      },
      boxShadow: {
        green: '20px 20px 60px #93b58a, -20px -20px 60px #c7f5ba'
      }
    }
  },
  plugins: []
}
