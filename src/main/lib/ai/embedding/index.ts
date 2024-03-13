import { readFileSync } from 'fs'
import { MemoFragmentData, MemoFragment, MemoModel } from '../../../models/model'
import { createTreeFromMarkdown, getChunkFromNodes } from './splitter'
import { embedding, getEmbeddingModel } from './embedding'
import {
  deleteDataAndIndex,
  getData,
  getMemoDataAndIndexes,
  importDataAndIndexes,
  saveData,
  saveIndexes
} from '../../../models/memo'
import { ulid } from 'ulid'
import { createMemo, deleteMemo, getMemories, updateMemo } from '../../../models'
import { postMsgToMainWindow } from '../../../window'

export interface EditFragmentOption {
  id: string
  fragment: MemoFragment
  type: 'add' | 'remove'
  useLLM?: boolean
}

const fragmentsMap: {
  [key in string]: MemoFragment[] | undefined
} = {}

let dataMap: {
  [key in string]: MemoFragmentData[] | undefined
} = {}

async function readFile(fragment: MemoFragment): Promise<{
  suc: boolean
  content?: string
  reason?: string
  fileName?: string
}> {
  if (fragment.type !== 'md') {
    return { suc: false, reason: '不支持的文件类型' }
  }
  const content = readFileSync(fragment.from!)
  return { suc: true, content: content.toString(), fileName: fragment.name }
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
      const nodes = createTreeFromMarkdown(res.content || '')
      try {
        const chunks = await getChunkFromNodes(nodes, {
          useLLM: option.useLLM,
          nodesFrom: res.fileName
        })
        for (let i = 0; i < chunks.length; i++) {
          const vectors: Float32Array[] = []
          const chunk = chunks[i]
          postMsgToMainWindow(`progress 存储知识中 ${i}/${chunks.length}`)
          for (let index of chunk.indexes) {
            const vector = await embedding(index.value)
            vectors.push(vector)
          }
          dataMap[option.id] === undefined && (dataMap[option.id] = [])
          dataMap[option.id]?.push({
            id: ulid(),
            name: option.fragment.name,
            data: chunk.document.content,
            vectors,
            indexes: chunk.indexes.map((index) => index.value),
            embeddingModel: getEmbeddingModel()
          })
        }
        postMsgToMainWindow('progress suc')
        fragmentsMap[option.id]?.push(option.fragment)
      } catch (e: Error | any) {
        if (e.message === 'llm error') {
          return { suc: false, reason: '大模型调用异常' }
        }
        if (e.message === 'llm not found') {
          return { suc: false, reason: '大模型未加载' }
        }
        return { suc: false, reason: '创建记忆胶囊失败' }
      }
    }
    return { suc: true }
  } else if (option.type === 'remove') {
    fragmentsMap[option.id] = fragmentsMap[option.id]?.filter(
      (fragment) => fragment.name !== option.fragment.name
    )
    dataMap[option.id] = dataMap[option.id]?.filter((index) => index.name !== option.fragment.name)
    return { suc: true }
  }
  return { suc: false, reason: '未匹配到操作类型' }
}
export interface SaveMemoParams {
  id: string
  memoName: string
  introduce?: string
  version?: number
}
export async function editMemo(memoId: string, fragments: MemoFragment[]) {
  fragmentsMap[memoId] = fragments
  dataMap[memoId] = await getMemoDataAndIndexes(memoId)
}
export async function saveMemo(params: SaveMemoParams) {
  const data = dataMap[params.id]
  if (params.id === 'creating') {
    const memoId = ulid()
    saveData(
      memoId,
      (data ?? []).map((item) => ({
        id: item.id,
        content: item.data,
        indexes: item.indexes,
        fileName: item.name
      }))
    )
    await saveIndexes(
      memoId,
      (data ?? []).map((item) => ({
        id: item.id,
        vectors: item.vectors
      }))
    )
    createMemo({
      id: memoId,
      name: params.memoName,
      introduce: params.introduce,
      fragment: fragmentsMap[params.id] ?? []
    })
  } else {
    await deleteDataAndIndex(params.id)
    saveData(
      params.id,
      (data ?? []).map((item) => ({
        id: item.id,
        content: item.data,
        indexes: item.indexes,
        fileName: item.name
      }))
    )
    await saveIndexes(
      params.id,
      (data ?? []).map((item) => ({
        id: item.id,
        vectors: item.vectors
      }))
    )
    updateMemo({
      id: params.id,
      name: params.memoName,
      version: params.version ?? 0,
      introduce: params.introduce,
      fragment: fragmentsMap[params.id] ?? []
    })
  }
  fragmentsMap[params.id] = undefined
  dataMap[params.id] = undefined
}
export async function dropMemo(memoId: string) {
  deleteDataAndIndex(memoId)
  deleteMemo(memoId)
  fragmentsMap[memoId] = undefined
  dataMap[memoId] = undefined
}
export interface GetMemoParams {
  id: string
  content: string
}
export function getMemo(data: GetMemoParams) {
  return getData(data)
}
export function cancelSaveMemo(id: string) {
  fragmentsMap[id] = undefined
  dataMap[id] = undefined
}
export async function exportMemo(memo: MemoModel) {
  const data = await getMemoDataAndIndexes(memo.id)
  memo.fragment.forEach((f) => (f.from = undefined))
  return (
    `gomoon-memo: ${memo.name}\n` +
    JSON.stringify({
      memo: memo,
      data: data.reduce((item, curr) => {
        return {
          ...item,
          [curr.id]: {
            content: curr.data,
            indexes: curr.indexes,
            fileName: curr.name,
            vectors: curr.vectors,
            embeddingModel: curr.embeddingModel
          }
        }
      }, {})
    })
  )
}
export async function importMemo(path: string) {
  // 取出第一行
  const data = readFileSync(path, 'utf-8')
  const [meta, memoContent] = data.split('\n')
  if (meta.startsWith('gomoon-memo: ')) {
    const { memo, data } = JSON.parse(memoContent)
    if (!memo || !data) {
      return false
    }
    getMemories().find((m) => m.id === memo.id) ? updateMemo(memo) : createMemo(memo)
    await importDataAndIndexes(memo.id, data)
    return true
  }
  return false
}
