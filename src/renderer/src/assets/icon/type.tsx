export interface SvgProps {
  width?: number
  height?: number
  fill?: string
  viewBox?: string
  class?: string
  onClick?: (
    e: MouseEvent & {
      currentTarget: SVGSVGElement
      target: Element
    }
  ) => void
}
