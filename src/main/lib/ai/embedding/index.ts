import { readFileSync } from 'fs'
import MemoryFragment from '../../../models/model'
import { createTreeFromMarkdown, getChunkFromNodes } from './splitter'

export interface EditFragmentOption {
  id: string
  fragment: MemoryFragment
  type: 'add' | 'remove'
  useLM: boolean
}

const fragmentsMap: {
  [key in string]: MemoryFragment[]
} = {}

async function readFile(fragment: MemoryFragment): Promise<{
  suc: boolean
  content?: string
  reason?: string
}> {
  if (fragment.type !== 'md') {
    return { suc: false, reason: '不支持的文件类型' }
  }
  const content = readFileSync(fragment.from)
  return { suc: true, content: content.toString() }
}

export async function editFragment(option: EditFragmentOption): Promise<{
  suc: boolean
  reason?: string
}> {
  if (option.type === 'add') {
    if (
      fragmentsMap[option.id] &&
      fragmentsMap[option.id].find((f) => f.name === option.fragment.name)
    ) {
      return { suc: false, reason: '已存在' }
    } else {
      fragmentsMap[option.id] === undefined && (fragmentsMap[option.id] = [])
      const res = await readFile(option.fragment)
      if (!res.suc) return { suc: false, reason: res.reason }
      // memory
      const nodes = createTreeFromMarkdown(res.content)
      // const data = await embedding(content)
      const chunks = await getChunkFromNodes(nodes, {
        chunkSize: 500,
        chunkOverlap: 2,
        useLM: option.useLM
      })
      // fragmentsMap[option.id].push(option.fragment)
    }
    return { suc: true }
  }
  return { suc: false, reason: '未匹配到操作类型' }
}
