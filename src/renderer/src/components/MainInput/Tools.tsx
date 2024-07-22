import { parseFile } from '@renderer/lib/ai/file'
import { For, Show, createSignal, onMount } from 'solid-js'
import type { Accessor, Setter, JSXElement } from 'solid-js'
import LeftArrow from '@renderer/assets/icon/base/arrow/LeftArrow'
import RightArrow from '@renderer/assets/icon/base/arrow/RightArrow'
import { recognizeText } from '@renderer/lib/ai/ocr'
import exportRecord from '@renderer/lib/md/exportRecord'
import { exportAssistants, importAssistants } from '@renderer/store/assistants'
import { parsePageForUrl } from '@renderer/lib/ai/url'
import {
  isNetworking,
  setNetworkingStatus,
  memoCapsule,
  setMemoCapsule
} from '@renderer/store/input'
import { userData } from '@renderer/store/user'
import { ContentDisplay, parseString } from '@renderer/lib/ai/parseString'
import CrossMarkRound from '@renderer/assets/icon/base/CrossMarkRound'
import { initMemories } from '@renderer/store/memo'

import { useLoading } from '../ui/DynamicLoading'
import { useToast } from '../ui/Toast'
export type Artifacts = ContentDisplay & { val: string }

function ToolWrap(props: { children: JSXElement; onClick?: () => void; active?: boolean }) {
  return (
    <div
      onClick={props.onClick}
      class={
        'flex cursor-pointer select-none rounded-lg border border-solid  border-dark-con px-1 py-[1px] text-[12px] hover:text-active ' +
        (props.active ? 'bg-active-con  text-text1' : 'bg-dark-plus hover:border-active')
      }
    >
      {props.children}
    </div>
  )
}

function ArtifactWrap(props: { children: JSXElement; onDel: () => void; noPadding?: boolean }) {
  return (
    <div class="relative max-w-[100%]">
      <div
        class={
          'flex cursor-pointer select-none rounded-lg border border-solid border-dark-con bg-dark-plus text-[12px] text-text1 hover:text-active ' +
          (props.noPadding ? '' : 'px-1 py-[1px]')
        }
      >
        {props.children}
      </div>
      <CrossMarkRound
        onClick={props.onDel}
        class="absolute right-[-2px] top-[-4px] cursor-pointer hover:text-active"
        height={16}
        width={16}
      />
    </div>
  )
}

export default function Tools(props: {
  artifacts: Accessor<Artifacts[]>
  setArtifacts: Setter<Artifacts[]>
  onInput: (content: string) => void
  type: 'chat' | 'ans'
}) {
  const toast = useToast()
  const load = useLoading()
  let toolsDiv: HTMLDivElement | undefined
  const [url, setUrl] = createSignal('')
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
  const addArtifact = (val: Artifacts) => {
    props.setArtifacts((arr) => arr.concat(val))
  }
  const removeArtifact = (index: number) => {
    props.setArtifacts((arr) => arr.filter((_, i) => index !== i))
  }
  const [showArrow, setShowArrow] = createSignal(false)
  onMount(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 出现滚动条时，显示左右箭头
        if (entry.target.scrollWidth > entry.target.clientWidth) {
          setShowArrow(true)
        } else {
          setShowArrow(false)
        }
      }
    })
    resizeObserver.observe(toolsDiv!)
  })
  return (
    <div>
      <div class="flex flex-wrap gap-1 px-1 py-2">
        <For each={props.artifacts()}>
          {(artifact, index) => {
            if (artifact.type === 'file') {
              return (
                <ArtifactWrap onDel={() => removeArtifact(index())}>
                  {artifact.filename}
                </ArtifactWrap>
              )
            }
            if (artifact.type === 'url') {
              return (
                <ArtifactWrap onDel={() => removeArtifact(index())}>
                  <a href={artifact.src} class="max-w-[100%]">
                    <p class="truncate">{artifact.src}</p>
                  </a>
                </ArtifactWrap>
              )
            }
            if (artifact.type === 'image') {
              return (
                <ArtifactWrap onDel={() => removeArtifact(index())} noPadding>
                  <img src={parseString(artifact.val, true)[0]['value']} class="w-20 rounded-md" />
                </ArtifactWrap>
              )
            }
            return <ArtifactWrap onDel={() => removeArtifact(index())}>{artifact.val}</ArtifactWrap>
          }}
        </For>
      </div>
      <div class="group/tools relative select-none px-1">
        <Show when={showArrow()}>
          <LeftArrow
            class="absolute left-[-16px] top-1/2 -translate-y-1/2 transform cursor-pointer fill-text1 opacity-0 delay-200 duration-200 hover:text-active group-hover/tools:opacity-100"
            width={18}
            height={18}
            onClick={() => scroll('left')}
          />
        </Show>
        {/* 文件上传按钮 */}
        <div
          ref={toolsDiv}
          class={
            (showArrow() ? '' : 'justify-center ') +
            'no-scroll-bar flex items-center gap-2 overflow-x-auto overflow-y-visible whitespace-nowrap'
          }
        >
          <ToolWrap>
            <label for="file" style={{ cursor: 'pointer' }}>
              <span class="text-[12px]">发送文件/图片</span>
              <input
                id="file"
                type="file"
                class="hidden"
                accept=".txt,.pdf,.docx,.doc,.pptx,.md,.json,.xlsx,.csv,.xls,.jpg,.jpeg,.png,.bmp,.webp"
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
                    let confirm = true
                    if (res.type !== 'image' && res.content.length > 2000) {
                      confirm = await toast.confirm(
                        <>
                          <div class="whitespace-nowrap py-1 text-base">
                            文件已超过2000字，确认发送吗？
                          </div>
                          <div>{`文件过大可能会导致资源浪费和回答出错。(当前字数：${
                            res.length ?? 0
                          })`}</div>
                        </>
                      )
                    }
                    confirm &&
                      addArtifact({
                        type: res.type,
                        value: res.content,
                        val: res.content,
                        src: res.src || '',
                        filename: res.filename || ''
                      })
                  }
                }}
              />
            </label>
          </ToolWrap>
          <ToolWrap
            // eslint-disable-next-line solid/reactivity
            onClick={async () => {
              const confirm = await toast.confirm(
                <div class="flex w-60 flex-col gap-1">
                  <span class="mb-1">输入链接</span>
                  <input
                    class="pr-2"
                    type="text"
                    value={url()}
                    onInput={(e) => {
                      setUrl(e.currentTarget.value)
                    }}
                  />
                </div>
              )
              if (confirm) {
                load.show('正在解析网页中的链接')
                try {
                  const content = await parsePageForUrl(url())
                  addArtifact({
                    type: 'url',
                    val: content,
                    src: url()
                  })
                } catch (err: any) {
                  if (err.message.includes('timeout of')) {
                    toast.error('链接连接超时')
                    return
                  }
                  console.error(err)
                  toast.error('链接解析失败')
                } finally {
                  setUrl('')
                }
                load.hide()
              }
            }}
          >
            解析链接
          </ToolWrap>
          <ToolWrap>
            <label for="ocr" style={{ cursor: 'pointer' }}>
              <span class="text-[12px]">文字识别</span>
              <input
                id="ocr"
                type="file"
                class="hidden"
                accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                multiple={false}
                onChange={async (e) => {
                  const file = e.target.files![0]
                  e.target.value = ''
                  // 去掉中文的空格
                  function removeChineseSpaces(str) {
                    return str
                      .replace(/([\u4e00-\u9fa5])\s+/g, '$1')
                      .replace(/\s+([\u4e00-\u9fa5])/g, '$1')
                  }
                  if (file) {
                    try {
                      const content = await recognizeText(file, (m) => {
                        load.show(m?.status || '正在识别图片中的文字')
                      })
                      props.onInput(removeChineseSpaces(content))
                    } catch (error: any) {
                      toast.error(error, {
                        duration: 3000,
                        position: 'top-1/3'
                      })
                    } finally {
                      load.hide()
                    }
                  }
                }}
              />
            </label>
          </ToolWrap>
          <ToolWrap
            active={isNetworking() && props.artifacts().length === 0}
            onClick={() => {
              if (userData.selectedModel === 'ERNIE4') {
                toast.warning('文心4模型已默认联网查询')
                return
              }
              if (props.artifacts().length) {
                toast.warning('请先清空参考文件或链接')
                return
              }
              setNetworkingStatus(!isNetworking())
              setMemoCapsule(false)
              toast.clear()
              isNetworking()
                ? toast.success('联网查询', {
                    duration: 2000,
                    position: 'top-1/3'
                  })
                : toast.success('已关闭联网查询')
            }}
          >
            联网查询
          </ToolWrap>
          <ToolWrap
            active={memoCapsule() && props.artifacts().length === 0}
            // eslint-disable-next-line solid/reactivity
            onClick={async () => {
              if (props.artifacts().length) {
                toast.warning('请先清空参考文件或链接')
                return
              }
              setMemoCapsule(!memoCapsule())
              setNetworkingStatus(false)
              memoCapsule()
                ? toast.success('记忆胶囊⚡️⚡️', {
                    duration: 2000,
                    position: 'top-1/3'
                  })
                : toast.success('已关闭记忆胶囊')
              if (memoCapsule() && !(await window.api.checkEmbeddingModel())) {
                load.show('功能初始化中...')
                const remove = window.api.receiveMsg(async (_, msg: string) => {
                  if (msg.startsWith('model-progress')) {
                    const progress = msg.replace(/^model-progress /, '')
                    load.show(`下载模型中${progress}...`)
                  }
                  if (msg.startsWith('progress')) {
                    const progress = msg.replace(/^progress /, '')
                    if (progress === '100%') {
                      remove()
                      return
                    }
                    load.show(`记忆初始化中${progress}...`)
                  }
                })
                try {
                  await initMemories()
                } catch (err: any) {
                  toast.error(err)
                }
                load.hide()
              }
            }}
          >
            <span class="text-[12px]">记忆胶囊</span>
          </ToolWrap>
          <ToolWrap
            // eslint-disable-next-line solid/reactivity
            onClick={() => {
              toast
                .modal(
                  (option) => (
                    <>
                      <div class="flex justify-center p-2"> 选择下载类型 </div>
                      <div class="flex gap-2 p-2">
                        <button onClick={() => option.close('md')}> md文档 </button>
                        <button onClick={() => option.close('png')}> png图片 </button>
                      </div>
                    </>
                  ),
                  {
                    mask: true
                  }
                )
                .then((res) => {
                  load.show(`正在导出 ${res}，请勿离开`)
                  const format = res as 'md' | 'png'
                  exportRecord(props.type, format).then((res) => {
                    load.hide()
                    if (res.suc) {
                      toast.success(res.result)
                      return
                    }
                    toast.error(res.result)
                  })
                })
            }}
          >
            下载对话记录
          </ToolWrap>
          <ToolWrap onClick={exportAssistants}>导出助手</ToolWrap>
          <ToolWrap>
            <label for="import-assistants" style={{ cursor: 'pointer' }}>
              <span class="text-[12px]">导入助手</span>
              <input
                id="import-assistants"
                type="file"
                class="hidden"
                accept=".json"
                multiple={false}
                onChange={async (e) => {
                  const file = e.target.files![0]
                  e.target.value = ''
                  if (file) {
                    const reader = new FileReader()
                    reader.readAsText(file)
                    reader.onload = async (e) => {
                      const content = e.target?.result
                      ;(await importAssistants(content as string))
                        ? toast.success('导入成功')
                        : toast.error('导入失败')
                    }
                  }
                }}
              />
            </label>
          </ToolWrap>
          {/* <ToolWrap>Terminal执行 (开发者选项)</ToolWrap>
        <ToolWrap onClick={() => toast.warning('还没做捏💦')}>代码开发 (开发者选项)</ToolWrap>
        <ToolWrap onClick={() => toast.warning('还没做捏💦')}>图表制作</ToolWrap> */}
        </div>
        <Show when={showArrow()}>
          <RightArrow
            class="absolute right-[-16px] top-1/2 -translate-y-1/2 transform cursor-pointer fill-text1 opacity-0 delay-200 duration-200 hover:text-active group-hover/tools:opacity-100"
            width={18}
            height={18}
            onClick={() => scroll('right')}
          />
        </Show>
      </div>
    </div>
  )
}
