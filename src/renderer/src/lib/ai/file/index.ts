export async function parseFile(file: File): Promise<{
  suc: boolean
  content: string
  length?: number
}> {
  // .doc
  if (file.type === 'application/msword') {
    return {
      suc: false,
      content: '请将 doc 文件转换成 docx 格式后重新发送'
    }
  }
  const str = await window.api.parseFile([
    {
      path: file.path,
      type: file.type || 'text/plain'
    }
  ])
  console.log(str, str.length)
  return {
    suc: true,
    content: `<gomoon-file src="${file.path}"/>帮我总结一下当前文件内容：\n` + str,
    length: str.length
  }
}
