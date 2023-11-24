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
        home: 'linear-gradient(to bottom, #525288, #0081c3, #00afc7, #00d489, #a8eb12)', // 首页背景色 渐变色 亮紫色-蓝色-青色-绿色-黄色
        dark: 'linear-gradient(to bottom right, #4c4d51, #404144)', // 暗黑模式背景色 渐变色 亮紫色-蓝色-青色-绿色-黄色
        light: 'linear-gradient(to bottom right, #fffffe, #d9d8d5)', // 亮色模式背景色 渐变色 白色-灰色
        purple: 'linear-gradient(to bottom right, #ae79f1, #9366cb)' // 紫色渐变色
      },
      colors: {
        active: '#A57BEA', // 激活色 亮紫色
        bac: '#525288', // 暗紫色
        gray: '#a7a8bd', // 非激活色 淡紫灰色
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
