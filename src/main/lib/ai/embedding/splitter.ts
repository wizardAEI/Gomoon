import markdownIt, { Token } from 'markdown-it'
import { lmInvoke } from '../langchain'

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

export interface Chunk {
  index: { value: string }[]
  document: { content: string }
}
export async function getChunkFromNodes(
  nodes: Node[],
  options: {
    chunkSize: number
    chunkOverlap: number
    useLM?: boolean
  } = {
    chunkSize: 500,
    chunkOverlap: 2 // 左右两个节点
  }
): Promise<Chunk[]> {
  const chunk: Chunk[] = []
  const { chunkSize, chunkOverlap } = options
  const dfs = async (nodes: Node[], index: number) => {
    const node = nodes[index]
    if (node.total.length < chunkSize) {
      chunk.push({
        index: [{ value: node.total }, { value: node.content }, { value: node.title }],
        document: { content: node.total }
      })
      // TODO: 这里使用大模型，由于时间问题后续需要加上进度功能
      if (options.useLM) {
        const content = (
          await lmInvoke({
            system: `我将会给你一段文字，请根据内容提出几个问题，使用序号标出。例如我给出『小明是一个学生，他喜欢打羽毛球。』，你将回复：
1. 小明是什么职业 
2. 小明的爱好是什么。
提出问题时不要延伸提问，确保现有内容可以明确的回答该问题；回复除了问题外不要添加任何其他内容。`,
            content: node.total
          })
        ).trim()
        content.split('\n').forEach((line) => {
          // 判断是否以序号开头，如果是则认为该行是问题，去除序号
          if (line.match(/^[0-9]+\./)) {
            line = line.replace(/^[0-9]+\./, '')
            chunk[chunk.length - 1].index.push({ value: line })
          }
        })
      }
      // TODO: 尝试加上 chunkOverlap 是否有效果
      let lapLNum = 0,
        lapRNum = 0
      while (lapLNum + lapRNum < chunkOverlap) {
        if (lapLNum <= index) {
          const n = nodes[index - lapLNum]
          if ((chunk[chunk.length - 1].document.content + '\n' + n.total).length > chunkSize) break
          chunk[chunk.length - 1].document = {
            content: chunk[chunk.length - 1].document.content + '\n' + n.total
          }
          lapLNum++
        }
        if (index + lapRNum < nodes.length) {
          const n = nodes[index + lapRNum]
          if ((chunk[chunk.length - 1].document.content + '\n' + n.total).length > chunkSize) break
          chunk[chunk.length - 1].document = {
            content: chunk[chunk.length - 1].document.content + '\n' + n.total
          }
          lapRNum++
        }
        if (lapLNum > index && index + lapRNum >= nodes.length) {
          break
        }
      }
    } else {
      for (let i = 0; i < node.children.length; i++) {
        await dfs(node.children, i)
      }
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    await dfs(nodes, i)
  }
  return chunk
}
