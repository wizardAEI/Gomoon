import { SvgProps } from './type'

export default function (props: SvgProps) {
  return (
    <svg width="100" height="50" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        width="100%"
        height="100%"
        rx="12"
        ry="12"
        fill="transparent"
        stroke="currentColor"
        stroke-width="8"
      />
      <text
        x="50%"
        y="58%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="currentColor"
        font-family="Arial"
        class="text-[32px]"
      >
        ESC
      </text>
    </svg>
  )
}
