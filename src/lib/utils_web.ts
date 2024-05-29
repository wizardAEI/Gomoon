function base64ToBlob(base64, mimeType) {
  // 解码Base64字符串
  const byteCharacters = atob(base64)
  // 创建一个8位的视图数组
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  // 将8位视图数组转换为Uint8Array
  const byteArray = new Uint8Array(byteNumbers)
  // 创建Blob对象
  return new Blob([byteArray], { type: mimeType })
}

export function base64ToFile(base64, fileName) {
  // 从Base64编码的URL中提取Base64字符串
  const base64Data = base64.split(',')[1]
  // 确定MIME类型
  const mimeMatch = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9]+).*,.*/)
  const mimeType = (mimeMatch ? (mimeMatch[1] ? mimeMatch[1] : '') : '') as string

  // 转换为Blob对象
  const blob = base64ToBlob(base64Data, mimeType)

  // 创建File对象
  return new File([blob], `${fileName}.${mimeType.split('/')[1] || 'png'}`, { type: mimeType })
}
