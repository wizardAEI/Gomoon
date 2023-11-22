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
        home: 'linear-gradient(to bottom, #525288, #0081c3, #00afc7, #00d489, #a8eb12);'
      },
      colors: {
        bac: '#525288',
        active: '#A57BEA',
        'icon-gray': '#a7a8bd',
        'icon-active': '#A371E1'
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
