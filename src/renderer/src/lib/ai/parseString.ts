export function removeMeta(str: string) {
  // 剔除 <gomoon-file ... /> <gomoon-url ... /> 等
  const regForFile = /^<gomoon-file .*?\/>/g,
    regForUrl = /^<gomoon-url .*?\/>/g
  return str.replace(regForFile, '').replace(regForUrl, '')
}
