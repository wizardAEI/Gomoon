import { SvgProps } from '../type'

export default function ClaudeIcon(props: SvgProps) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="48pt"
      height="48pt"
      viewBox="0 0 48 48"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <rect x="0" y="0" width="48" height="48" fill="white" />
      <g transform="translate(0,48) scale(0.1,-0.1)" fill="#000000" stroke="none">
        <path
          d="M161 343 c-14 -27 -81 -204 -81 -214 0 -20 41 -8 52 16 10 22 18 25
60 25 42 0 50 -3 60 -25 7 -16 19 -25 35 -25 12 0 23 2 23 5 0 3 -21 57 -46
120 -41 101 -49 115 -70 115 -13 0 -27 -8 -33 -17z m55 -120 c-2 -2 -15 -3
-28 -1 -24 3 -24 4 -10 38 l15 35 14 -34 c8 -18 12 -35 9 -38z"
        />
        <path
          d="M270 348 c1 -7 20 -60 43 -118 35 -84 47 -106 65 -108 30 -5 28 5
-21 128 -34 86 -46 106 -64 108 -14 2 -23 -2 -23 -10z"
        />
      </g>
    </svg>
  )
}
