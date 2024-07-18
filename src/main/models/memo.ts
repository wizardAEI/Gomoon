// TODO: db.data = xxx and db.write() -> db.update(data => data = xxx )
import { join } from 'path'
import { existsSync, mkdirSync, unlinkSync } from 'fs'

import { app } from 'electron'
import { JSONFileSyncPreset } from 'lowdb/node'
import { Connection, connect } from 'vectordb'

import { embedding, getEmbeddingModel } from '../lib/ai/embedding/embedding'
import { postMsgToMainWindow } from '../window'

import { MemoFragmentData, MemoResult } from './model'

const appDataPath = app.getPath('userData')
const memoPath = join(appDataPath, 'memo')
let dbl: Connection | null = null

async function connectDB() {
  if (dbl) return
  dbl = await connect(join(memoPath))
}

mkdirSync(memoPath, { recursive: true })

interface MemoData {
  [id: string]: {
    content: string
    indexes: string[]
    fileName: string
  }
}

export function saveData(
  memoId: string,
  data: {
    fileName: string
    id: string
    content: string
    indexes: string[]
  }[]
) {
  const path = join(memoPath, memoId)
  const db = JSONFileSyncPreset<MemoData>(path, {})
  data.forEach((d) => {
    db.data[d.id] = {
      content: d.content,
      fileName: d.fileName,
      indexes: d.indexes
    }
  })
  db.write()
}

export interface ImportMemoDataModel {
  content: string
  indexes: string[]
  fileName: string
  embeddingModel: string
  vectors?: Float32Array[]
}

export async function deleteDataAndIndex(memoId: string) {
  // delete memo data file
  const path = join(memoPath, memoId)
  existsSync(path) && unlinkSync(path)
  // delete memo indexes table
  await connectDB()
  const tables = await dbl!.tableNames()
  if (tables.includes(memoId)) {
    await dbl!.dropTable(memoId)
  }
}

export async function saveIndexes(
  memoId: string,
  data: {
    id: string
    vectors: Float32Array[]
  }[]
) {
  await connectDB()
  const tables = await dbl!.tableNames()
  if (!tables.includes(memoId)) {
    const tableData = data.reduce(
      (
        arr: {
          id: string
          vector: Float32Array
        }[],
        item
      ) => {
        return arr.concat(
          item.vectors.map((vector) => ({
            id: item.id,
            vector: vector
          }))
        )
      },
      []
    )
    await dbl!.createTable(memoId, tableData)
    return
  }
  const table = await dbl!.openTable(memoId)
  table.add(data)
}

export async function importDataAndIndexes(
  memoId: string,
  data: {
    [id: string]: ImportMemoDataModel
  }
) {
  const path = join(memoPath, memoId)
  const db = JSONFileSyncPreset<MemoData>(path, data)
  await deleteDataAndIndex(memoId)
  const indexes: {
    [key in string]: Float32Array[] | undefined
  } = {}
  for (let i = 0; i < Object.keys(data).length; i++) {
    const key = Object.keys(data)[i]
    const item = data[key]
    for (let j = 0; j < item.indexes.length; j++) {
      if (item.vectors?.[j] && item.embeddingModel === getEmbeddingModel()) {
        indexes[key] ? indexes[key]?.push(item.vectors[j]) : (indexes[key] = [item.vectors[j]])
        continue
      }
      const v = await embedding(item.indexes[j])
      indexes[key] ? indexes[key]?.push(v) : (indexes[key] = [v])
    }
    postMsgToMainWindow(`progress ${((i / Object.keys(data).length) * 100).toFixed(0)}%`)
  }
  await saveIndexes(
    memoId,
    Object.keys(indexes).map((key) => ({
      id: key,
      vectors: indexes[key] ?? []
    }))
  )
  db.write()
}

export async function getData(data: { id: string; content: string }): Promise<Array<MemoResult>> {
  await connectDB()
  const tables = await dbl!.tableNames()
  if (!tables.includes(data.id)) {
    return []
  }
  const table = await dbl!.openTable(data.id)
  const indexes = await embedding(data.content)
  const result = (await table
    .search(Array.from(indexes.map((index) => Number(index))))
    .limit(20)
    .execute()) as {
    id: string
  }[]
  const path = join(memoPath, data.id)
  const fileDB = JSONFileSyncPreset<MemoData>(path, {})
  const contents: {
    content: string
  }[] = []
  result.forEach((item) => {
    if (contents.find((c) => c.content === fileDB.data[item.id]?.content) || contents.length >= 4)
      return
    contents.push({
      content: fileDB.data[item.id]?.content || ''
    })
  })
  return contents
}

export async function getMemoDataAndIndexes(memoId: string): Promise<MemoFragmentData[]> {
  const path = join(memoPath, memoId)
  const jsonDb = JSONFileSyncPreset<MemoData>(path, {})
  const arr: MemoFragmentData[] = []
  for (const key in jsonDb.data) {
    await connectDB()
    const tables = await dbl!.tableNames()
    if (!tables.includes(memoId)) {
      return []
    }
    const table = await dbl!.openTable(memoId)
    const res = await table.filter(`id = '${key}'`).execute()
    arr.push({
      id: key,
      name: jsonDb.data[key].fileName,
      data: jsonDb.data[key].content,
      vectors: res.map((item) => item.vector as Float32Array),
      indexes: jsonDb.data[key].indexes,
      embeddingModel: getEmbeddingModel()
    })
  }
  return arr
}
