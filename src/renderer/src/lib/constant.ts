function stringError(err: Error) {
  return `\n\n发生错误: ${err.message}`
}

export function ErrorDict(err: Error): string {
  console.log('error', err)
  if (err.message.includes('AbortError') || err.name.includes('AbortError')) {
    return ' ⏹'
  } else if (
    err.message.includes('Request timed out.') ||
    err.name.includes('Request timed out.')
  ) {
    return '\n\n回答超时，请检查网络后重试'
  } else if (err.message.includes('401') || err.message.includes('Failed to fetch')) {
    return `密钥或BaseURL不正确。\n请点击${
      navigator.userAgent.includes('Mac') ? '右' : '左'
    }上角设置，进入设置页面进行设置。`
  } else if (err.message.includes('404')) {
    return `${stringError(err)}\n这通常是由于您未配置上述缺少的模型。`
  } else if (err.message.includes('maximum')) {
    return `${stringError(err)}\n这通常是由于您的总字数超过了模型的限制。`
  } else if (err.message.includes('Open api daily request limit reached')) {
    return `${stringError(err)}\n如果你是文心用户，请于[在线服务](https://console.bce.baidu.com/qianfan/ais/console/onlineService?tab=preset)开通付费。\n 文心3需要开通\`ERNIE-3.5-8K\`；文心4需要开通\`ERNIE-4.0-8K\`；文心128k需要开通\`ERNIE-Speed-128K\`。`
  }
  return `${stringError(err)}`
}
