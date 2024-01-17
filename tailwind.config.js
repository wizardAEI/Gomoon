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
      PingFangSCMedium: ['PingFangSC-Medium'],
      System: ['-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
    },
    extend: {
      backgroundImage: {
        cyber: 'linear-gradient(to right, #2d535d, #005271, #004c86, #2b3f90, #642388)', // 赛博蓝渐变色
        'cyber-pro': 'linear-gradient(to right, #2d6170, #006089, #005aa0, #364cac, #792ba4);', // 赛博蓝渐变色↑
        'active-gradient': 'linear-gradient(to bottom right, #ae79f1, #9366cb)', // 淡紫色渐变色
        'green-gradient': 'linear-gradient(to right bottom, #007a93, #078170)', // 绿色渐变色
        home: 'linear-gradient(to top, #040c17, #0d1821, #10212b, #132b35, #16353e)' // 深蓝灰转深蓝绿
      },
      colors: {
        active: '#a57bea', // 激活色 亮紫色
        'active-pro': '#c08eaf', // 激活色↑ 罗兰紫
        'active-bac': '#253241', // 激活色的背景色 深灰蓝
        gray: '#869d9d', // 非激活色 淡紫灰色
        'gray-pro': '#93a5a6', // 非激活色↑ 浅紫灰色
        'dark-con': '#436565', // 暗色稍微亮一点
        dark: '#254852', // 暗色 深蓝绿
        'dark-plus': '#1f3d48', // 暗色稍微深一点
        'dark-pro': '#152431', // 暗色↑
        light: '#e2e1e4', // 亮色 芡食白
        text1: '#d8e3e7', // 云峰白
        text2: '#baccd9', // 云水蓝
        text3: '#baccd970', // 云水蓝70%
        'text-dark': '#151b26', // 深色
        'text-dark2': '#276b84', // 深蓝绿
        'text-link': '#2382c6', // 链接色
        'white/70': '#ffffff70', // 白色透明度70%
        success: '#12c569', // 绿色
        error: '#DF919C', // 红色
        warning: '#f59c13' // 黄色
      },
      keyframes: {
        click: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
          '20%': {
            transform: 'scale(0.95) translateY(1px)'
          },
          '80%': { transform: 'scale(0.95) translateY(1px)' },
          '100%': { transform: 'scale(1)' }
        },
        popup: {
          '0%': { opacity: 0 },
          '100%': { transform: 'translateY(-12px)', opacity: 1 }
        },
        'scale-down-entrance': {
          '0%': { transform: 'scale(1.1)', opacity: 0.5 },
          '100%': { transform: 'scale(1)' }
        },
        'rotate-180': {
          '0%': { transform: 'rotate(45deg)' },
          '100%': { transform: 'rotate(225deg)' }
        }
      },
      animation: {
        click: 'click 0.2s ease-in-out',
        popup: 'popup 0.2s ease-in-out forwards',
        'scale-down-entrance': 'scale-down-entrance 0.3s ease-in-out forwards',
        'rotate-180': 'rotate-180 0.3s ease-in-out forwards'
      },
      boxShadow: {
        green: '20px 20px 60px #93b58a, -20px -20px 60px #c7f5ba',
        center: '0px 2px 12px #51939330'
      }
    }
  },
  plugins: []
}
