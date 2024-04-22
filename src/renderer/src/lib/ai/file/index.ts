import { FileLoaderRes } from 'src/main/lib/ai/fileLoader'

export async function parseFile(file: File): Promise<
  {
    suc: boolean
    length: number
  } & FileLoaderRes
> {
  // .doc
  if (file.type === 'application/msword') {
    return {
      suc: false,
      content: '请将 doc 文件转换成 docx 格式后重新发送',
      length: 0,
      src: '',
      filename: '',
      type: 'file'
    }
  }
  const fileLoader = await window.api.parseFile([
    {
      path: file.path,
      type: file.type || 'text/plain'
    }
  ])

  try {
    let content = ''
    if (fileLoader.type === 'file') {
      const type = fileLoader.filename.split('.').pop() ?? '文本'
      content =
        `<gomoon-file src="${fileLoader.src}" filename="${fileLoader.filename}">这是一个${type}文件的文本内容：\n` +
        fileLoader.content +
        '</gomoon-file>'
    } else {
      content =
        `<gomoon-image src="${fileLoader.src}" filename="${fileLoader.filename}">` +
        fileLoader.content +
        '</gomoon-image>'
    }
    return {
      suc: true,
      content,
      length: fileLoader.content.length,
      src: fileLoader.src,
      filename: fileLoader.filename,
      type: fileLoader.type
    }
  } catch (e) {
    return {
      suc: false,
      content: '解析失败' + (e as Error).message,
      length: 0,
      src: '',
      filename: '',
      type: fileLoader.type
    }
  }
}
