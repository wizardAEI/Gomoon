import { parseFile } from '@renderer/lib/ai/file'
import { useToast } from '../ui/Toast'

export default function (props: { onSubmit: (content: string) => void }) {
  const toast = useToast()
  return (
    <div class="flex gap-2">
      {/* 文件上传按钮 */}
      <label
        class="flex cursor-pointer rounded-lg border border-solid border-dark-con bg-dark px-1 py-[1px] hover:border-active hover:text-white"
        for="file"
      >
        <span class="text-[12px]">发送文件</span>
        <input
          id="file"
          type="file"
          class="hidden"
          accept=".txt,.pdf,.docx,.doc,.pptx,.md"
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
    </div>
  )
}
