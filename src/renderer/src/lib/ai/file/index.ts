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
  let fileLoader: FileLoaderRes
  if (!file.path) {
    fileLoader = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async function (event) {
        resolve(
          await window.api.parseFile([
            {
              path: file.name,
              type: file.type || 'text/plain',
              data: event.target?.result as string
            }
          ])
        )
      }
      reader.onerror = function (event) {
        reject(event.target?.error)
      }
      reader.readAsDataURL(file) // 读取文件内容为 Data URL
    })
  } else {
    fileLoader = await window.api.parseFile([
      {
        path: file.path,
        type: file.type || 'text/plain'
      }
    ])
  }
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
    console.log(fileLoader.content)
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
