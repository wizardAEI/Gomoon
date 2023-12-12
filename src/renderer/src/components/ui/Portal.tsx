import { createMemo, onCleanup } from 'solid-js'
import { render } from 'solid-js/web'

export default function Portal(props) {
  // 创建一个新的 portal 元素，将作为 portal 的容器
  const portalContainer = document.createElement('portal')

  // 将新创建的 portal 添加到 body 或其他目标容器中
  document.body.appendChild(portalContainer)

  // 清理工作：组件卸载时移除这个 div
  onCleanup(() => {
    document.body.removeChild(portalContainer)
  })

  // 使用 SolidJS 的渲染函数将子元素渲染到 portalContainer 中
  return createMemo(() => {
    render(() => props.children, portalContainer)
  })
}
