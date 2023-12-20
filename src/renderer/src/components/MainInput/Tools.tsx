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
              // .doc
              if (file.type === 'application/msword') {
                toast.error('请将 doc 文件转换成 docx 格式后重新发送', {
                  duration: 3000,
                  position: 'top-1/3'
                })
                return
              }
              const str = await window.api.parseFile([
                {
                  path: file.path,
                  type: file.type || 'text/plain'
                }
              ])
              console.log(str)
              if (str.length > 2000) {
                const res = await toast.confirm(
                  <>
                    <div class="whitespace-nowrap py-1 text-base">
                      文件已超过2000字，确认发送吗？
                    </div>
                    <div>{`文件过大可能会导致资源浪费和回答出错。(当前字数：${str.length})`}</div>
                  </>
                )
                res &&
                  props.onSubmit(
                    `<gomoon-file src="${file.path}"/>帮我总结一下当前文件内容：\n` + str
                  )
                return
              }
              props.onSubmit(str)
            }
          }}
        />
      </label>
    </div>
  )
}
