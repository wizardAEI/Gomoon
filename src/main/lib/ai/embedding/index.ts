import { readFileSync } from 'fs'
import MemoryFragment from '../../../models/model'
import { createTreeFromMarkdown, getChunkFromNodes } from './splitter'
import { embedding } from './embedding'
import { saveData, saveIndex } from '../../../models/embedding'
import { ulid } from 'ulid'
import { createMemo } from '../../../models'

export interface EditFragmentOption {
  id: string
  fragment: MemoryFragment
  type: 'add' | 'remove'
  useLM: boolean
}

const fragmentsMap: {
  [key in string]: MemoryFragment[] | undefined
} = {}

let dataMap: {
  [key in string]:
    | { name: string; data: string; vectors: Float32Array[]; indexes: string[] }[]
    | undefined
} = {}

async function readFile(fragment: MemoryFragment): Promise<{
  suc: boolean
  content?: string
  reason?: string
}> {
  if (fragment.type !== 'md') {
    return { suc: false, reason: '不支持的文件类型' }
  }
  const content = readFileSync(fragment.from!)
  return { suc: true, content: content.toString() }
}

export async function editFragment(option: EditFragmentOption): Promise<{
  suc: boolean
  reason?: string
}> {
  if (option.type === 'add') {
    if (
      fragmentsMap[option.id] &&
      fragmentsMap[option.id]?.find((f) => f.name === option.fragment.name)
    ) {
      return { suc: false, reason: '已存在同名记忆片段' }
    } else {
      fragmentsMap[option.id] === undefined && (fragmentsMap[option.id] = [])
      const res = await readFile(option.fragment)
      if (!res.suc) return { suc: false, reason: res.reason }
      // memory
      const nodes = createTreeFromMarkdown(res.content)
      const chunks = await getChunkFromNodes(nodes, {
        chunkSize: 500,
        chunkOverlap: 2,
        useLM: option.useLM
      })
      for (let chunk of chunks) {
        const vectors: Float32Array[] = []
        for (let index of chunk.indexes) {
          const vector = await embedding(index.value)
          vectors.push(vector)
        }
        dataMap[option.id] === undefined && (dataMap[option.id] = [])
        dataMap[option.id]?.push({
          name: option.fragment.name,
          data: chunk.document.content,
          vectors,
          indexes: chunk.indexes.map((index) => index.value)
        })
      }
      fragmentsMap[option.id]?.push(option.fragment)
    }
    return { suc: true }
  } else if (option.type === 'remove') {
    fragmentsMap[option.id] = fragmentsMap[option.id]?.filter(
      (fragment) => fragment.name !== option.fragment.name
    )
    dataMap[option.id] = dataMap[option.id]?.filter((index) => index.name !== option.fragment.name)
  }
  return { suc: false, reason: '未匹配到操作类型' }
}

export interface SaveMemoParams {
  id: string
  memoName: string
  introduce?: string
}
export async function saveMemo(params: SaveMemoParams) {
  const data = dataMap[params.id]
  const name = ulid()
  if (params.id === 'creating') {
    saveData(
      name,
      (data || []).map((item) => ({
        id: ulid(),
        content: item.data,
        indexes: item.indexes
      }))
    )
    await saveIndex(
      name,
      (data || []).map((item) => ({
        id: ulid(),
        vectors: item.vectors
      }))
    )
    createMemo({
      name: params.memoName,
      introduce: params.introduce,
      fragment: fragmentsMap[params.id] || []
    })
  }
  fragmentsMap[params.id] = undefined
  dataMap[params.id] = undefined
}

export function cancelSaveMemo(id: string) {
  fragmentsMap[id] = undefined
  dataMap[id] = undefined
}
