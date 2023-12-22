export function decorateContent(c: string) {
  if (c.length > 50) {
    return c.slice(0, 50) + ' ......'
  }
  return c
}
