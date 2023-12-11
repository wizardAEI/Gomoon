export function ErrorDict(err: Error): string {
  console.log(err)
  if (err.message.includes('AbortError') || err.name.includes('AbortError')) {
    return ' ⏹'
  } else if (
    err.message.includes('Request timed out.') ||
    err.name.includes('Request timed out.')
  ) {
    return '\n\n回答超时，请重试'
  }
  return `\n\n出问题了:${err.name}: ${err.message}`
}
