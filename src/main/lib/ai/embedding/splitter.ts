import markdownIt, { Token } from 'markdown-it'

const md = markdownIt()

interface Node {
  title: string
  content: string
  total: string
  children: Node[]
}

export function createTreeFromMarkdown(markdown): Node[] {
  const tree: Node[] = []
  const tokens: Token[] = md.parse(markdown, {})
  if (!tokens.find((t) => t.type === 'heading_open')) {
    let i = 0
    while (i < tokens.length) {
      if (tokens[i].type === 'inline') {
        tree.push({
          title: tokens[i].content,
          content: markdown,
          total: markdown,
          children: []
        })
        break
      }
      i++
    }
    return tree
  }
  let i = 0
  const isType = (tokenType: string) => {
    return tokens[i].type === tokenType
  }
  const splice = (a: string, b: string) => {
    if (a.length) {
      return a + '\n' + b
    }
    return b
  }
  const buildTree = (nodes: Node[], level = 1, totalBefore = '') => {
    while (i < tokens.length) {
      if (!isType('heading_open')) {
        i++
        continue
      }
      let content = tokens[i].markup
      while (i < tokens.length && !isType('inline')) i++
      const title = tokens[i].content
      content += ` ${tokens[i].content}`
      i++
      while (i < tokens.length && !isType('heading_open')) {
        if (isType('inline')) content += '\n' + tokens[i].content
        if (isType('fence')) {
          const fence = tokens[i]
          content += '\n' + fence.markup + fence.info + '\n' + fence.content + fence.markup
        }
        i++
      }
      const node = {
        title: title,
        content: content,
        total: '',
        children: []
      }
      nodes.push(node)
      if (i === tokens.length) {
        node.total = content
        return splice(totalBefore, content)
      }
      const levelNext = parseInt(tokens[i].tag.slice(1))
      if (levelNext > level) {
        node.total = buildTree(node.children, levelNext, splice(totalBefore, content))
        continue
      } else if (levelNext === level) {
        node.total = content
        totalBefore = splice(totalBefore, content)
        continue
      }
      node.total = content
      return splice(totalBefore, content)
    }
    return totalBefore
  }
  buildTree(tree)
  return tree
}
