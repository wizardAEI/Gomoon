/** @type {import('tailwindcss').Config} */
// TODO: 将 dark 类写作 primary-bac 将 light 类写作 secondary-bac
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
        dropdown: {
          '0%': { opacity: 0 },
          '100%': { transform: 'translateY(12px)', opacity: 1 }
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
        dropdown: 'dropdown 0.2s ease-in-out forwards',
        'scale-down-entrance': 'scale-down-entrance 0.3s ease-in-out forwards',
        'rotate-180': 'rotate-180 0.3s ease-in-out forwards'
      }
    }
  },
  plugins: [
    require('tailwindcss-themer')({
      defaultTheme: {
        extend: {
          backgroundImage: {
            cyber: 'linear-gradient(to right, #2d535d, #005271, #004c86, #2b3f90, #642388)', // 赛博蓝渐变色
            'cyber-pro': 'linear-gradient(to right, #2d6170, #006089, #005aa0, #364cac, #792ba4)', // 赛博蓝渐变色↑
            'active-gradient': 'linear-gradient(to bottom right, #ae79f1, #9366cb)', // 淡紫色渐变色
            'green-gradient': 'linear-gradient(to bottom right, #007a93, #078170)', // 绿色渐变色
            home: 'linear-gradient(to top, #040c17, #0d1821, #10212b, #132b35, #16353e)' // 深蓝灰转深蓝绿
          },
          colors: {
            active: '#a57bea', // 激活色 亮紫色
            'active-con': '#7c56ba', // 激活色 深紫
            gray: '#869d9d', // 非激活色 淡紫灰色
            'inline-code': '#869d9d', // 非激活色 浅紫灰色
            code: '#132c33', // 非激活色 浅紫灰色
            'gray-pro': '#93a5a6', // 非激活色↑ 浅紫灰色
            'dark-con': '#436565', // 暗色稍微亮一点
            'home-top': '#16353e', // 首页顶部渐变色
            dark: '#22444e', // 暗色 深蓝绿
            'dark-plus': '#1f3d48', // 暗色稍微深一点
            'dark-pro': '#152431', // 暗色↑
            light: '#e2e1e4', // 亮色 芡食白
            'light-gray': '#c4cbcf', // 大理石灰
            text1: '#d8e3e7', // 云峰白
            text2: '#d0dfe6', // 远天蓝
            text3: '#d0dfe680', // 远天蓝70%
            'text-code': '#abb2bf', // 云峰白
            'text-active': '#d8e3e7', // 激活的背景上的文字
            'text-dark': '#151b26', // 深色
            'text-dark2': '#276b84', // 深蓝绿
            'text-link': '#2382c6', // 链接色
            mask: '#00000090',
            'white/70': '#ffffff70', // 白色透明度70%
            success: '#12c569', // 绿色
            error: '#DF919C', // 红色
            warning: '#f59c13', // 黄色
            selection: '#73a7ef80' // 文字选中
          },
          boxShadow: {
            green: '20px 20px 60px #93b58a, -20px -20px 60px #c7f5ba',
            center: '0px 2px 12px #00000070',
            's-dark': '0 4px 6px -1px #00000060',
            's-light': '0 4px 6px -1px #385b6070'
          }
        }
      },
      themes: [
        {
          name: 'light',
          selectors: ['.light-theme'],
          extend: {
            backgroundImage: {
              cyber: 'linear-gradient(to right, #489d83, #58a484, #67ab85, #77b286, #86b988)', // 赛博蓝渐变色
              'cyber-pro': 'linear-gradient(to right, #50ae91, #5fb591, #6ebc90, #7dc38f, #8dc98f)', // 赛博蓝渐变色↑
              'active-gradient': 'linear-gradient(to bottom right, #ae79f1, #9366cb)', // 淡紫色渐变色
              'green-gradient': 'linear-gradient(to bottom right, #007a93, #078170)', // 绿色渐变色
              home: 'linear-gradient(to bottom, #eaeeee, #dde6e8, #dae6e8, #d7e7e9, #d4e7e9)'
            },
            colors: {
              active: '#50AF4B',
              'active-con': '#7AC078',
              gray: '#9FADAB',
              'gray-pro': '#7A8E8B', // 非激活色↑ 浅紫灰色
              'inline-code': '#CCD9D9', // 非激活色 浅紫灰色
              code: '#FCFEFE',
              'home-top': '#16353e',
              'dark-con': '#FAFBFB',
              dark: '#EFF2F4',
              'dark-plus': '#F1F5F7',
              'dark-pro': '#F2F8FA',
              light: '#e6f1f5',
              'light-gray': '#dee9e7',
              text1: '#181a07',
              text2: '#25270b',
              text3: '#70887d70',
              'text-code': '#474b4c',
              'text-active': '#eef7f2', // 激活的背景上的文字
              'text-dark': '#151b26', // 深色
              'text-dark2': '#276b84', // 深蓝绿
              'text-link': '#2382c6', // 链接色
              mask: '#ffffff80',
              'white/70': '#ffffff70', // 白色透明度70%
              success: '#12c569', // 绿色
              error: '#DF919C', // 红色
              warning: '#f59c13', // 黄色
              selection: '#73a7ef80'
            },
            boxShadow: {
              green: '20px 20px 60px #93b58a, -20px -20px 60px #c7f5ba',
              center: '0px 2px 12px #385b6070',
              's-dark': '0 4px 6px -1px #00000020',
              's-light': '0 4px 6px -1px #00000020'
            }
          }
        }
      ]
    })
  ]
}
