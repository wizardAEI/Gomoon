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
  const fileLoader = await window.api.parseFile([
    {
      path: file.path,
      type: file.type || 'text/plain'
    }
  ])
  const type = fileLoader.filename.split('.').pop() ?? '文本'
  return {
    suc: true,
    content:
      `<gomoon-file src="${fileLoader.path}" filename="${fileLoader.filename}" />接下来我会把一个${type}文件的全部文本内容发送给你，请你理解内容并给出一个精简的总结：\n` +
      fileLoader.content,
    length: fileLoader.content.length
  }
}
