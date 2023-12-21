import { parseFile } from '@renderer/lib/ai/file'
import { useToast } from '../ui/Toast'
import { JSX } from 'solid-js'
import LeftArrow from '@renderer/assets/icon/base/arrow/LeftArrow'
import RightArrow from '@renderer/assets/icon/base/arrow/RightArrow'
import { recognizeText } from '@renderer/lib/ai/ocr'
import { useLoading } from '../ui/DynamicLoading'

function ToolWrap(props: { children: JSX.Element; onClick?: () => void }) {
  return (
    <div
      onClick={props.onClick}
      class="bg-dark-plus flex cursor-pointer select-none rounded-lg border border-solid border-dark-con px-1 py-[1px] text-[12px] hover:border-active hover:text-white"
    >
      {props.children}
    </div>
  )
}

export default function (props: {
  onSubmit: (content: string) => void
  onInput: (content: string) => void
}) {
  const toast = useToast()
  let toolsDiv: HTMLDivElement | undefined
  const dynamicLoading = useLoading()
  const scroll = (position: 'left' | 'right') => {
    if (!toolsDiv) return
    const scrollLeft = toolsDiv.scrollLeft
    const clientWidth = toolsDiv.clientWidth
    const scrollDistance = clientWidth / 2 + 10
    if (position === 'left') {
      toolsDiv.scrollTo({
        left: scrollLeft - scrollDistance,
        behavior: 'smooth'
      })
    } else {
      toolsDiv.scrollTo({
        left: scrollLeft + scrollDistance,
        behavior: 'smooth'
      })
    }
  }
  return (
    <div class="group/tools relative px-1">
      <LeftArrow
        class="absolute left-[-16px] top-1/2 -translate-y-1/2 transform cursor-pointer opacity-0 delay-200 duration-200 hover:text-active group-hover/tools:opacity-100"
        width={18}
        height={18}
        onClick={() => scroll('left')}
      />
      {/* 文件上传按钮 */}
      <div
        ref={toolsDiv}
        class="no-scroll-bar flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap"
      >
        <ToolWrap>
          <label for="file" style={{ cursor: 'pointer' }}>
            <span class="text-[12px]">发送文件</span>
            <input
              id="file"
              type="file"
              class="hidden"
              accept=".txt,.pdf,.docx,.doc,.pptx,.md,.json,.xlsx,.csv,.xls"
              multiple={false}
              onChange={async (e) => {
                const file = e.target.files![0]
                e.target.value = ''
                if (file) {
                  const res = await parseFile(file)
                  if (!res.suc) {
                    toast.error(res.content, {
                      duration: 3000,
                      position: 'top-1/3'
                    })
                    return
                  }
                  if (res.content.length > 2000) {
                    const confirm = await toast.confirm(
                      <>
                        <div class="whitespace-nowrap py-1 text-base">
                          文件已超过2000字，确认发送吗？
                        </div>
                        <div>{`文件过大可能会导致资源浪费和回答出错。(当前字数：${
                          res.length ?? 0
                        })`}</div>
                      </>
                    )
                    confirm && props.onSubmit(res.content)
                    return
                  }
                  props.onSubmit(res.content)
                }
              }}
            />
          </label>
        </ToolWrap>
        <ToolWrap>
          <label for="ocr" style={{ cursor: 'pointer' }}>
            <span class="text-[12px]">文字图片解析</span>
            <input
              id="ocr"
              type="file"
              class="hidden"
              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
              multiple={false}
              onChange={async (e) => {
                const file = e.target.files![0]
                e.target.value = ''
                if (file) {
                  try {
                    const content = await recognizeText(file, (m) => {
                      dynamicLoading.show(m?.status || '正在识别图片中的文字')
                    })
                    props.onInput(content)
                  } catch (error: any) {
                    toast.error(error, {
                      duration: 3000,
                      position: 'top-1/3'
                    })
                  } finally {
                    dynamicLoading.hide()
                  }
                }
              }}
            />
          </label>
        </ToolWrap>
        <ToolWrap>解析链接</ToolWrap>
        <ToolWrap>联网查询</ToolWrap>
        <ToolWrap>下载对话记录</ToolWrap>
        <ToolWrap>导出助手</ToolWrap>
        <ToolWrap>导入助手</ToolWrap>
        <ToolWrap>Terminal执行 (开发者选项)</ToolWrap>
        <ToolWrap>代码开发 (开发者选项)</ToolWrap>
        <ToolWrap onClick={() => toast.warning('还没做捏💦')}>图表制作</ToolWrap>
      </div>
      <RightArrow
        class="absolute right-[-16px] top-1/2 -translate-y-1/2 transform cursor-pointer opacity-0 delay-200 duration-200 hover:text-active group-hover/tools:opacity-100"
        width={18}
        height={18}
        onClick={() => scroll('right')}
      />
    </div>
  )
}
