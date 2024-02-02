export async function parseFile(file: File): Promise<{
  suc: boolean
  content: string
  length?: number
  src?: string
  filename?: string
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
      `<gomoon-file src="${fileLoader.path}" filename="${fileLoader.filename}">这是一个${type}文件的文本内容：\n` +
      fileLoader.content +
      '</gomoon-file>',
    length: fileLoader.content.length,
    src: fileLoader.path,
    filename: fileLoader.filename
  }
}
