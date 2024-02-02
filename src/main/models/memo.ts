import { app } from 'electron'
import { join } from 'path'
import { JSONSyncPreset } from 'lowdb/node'
import { Connection, connect } from 'vectordb'
import { existsSync, mkdirSync, unlinkSync } from 'fs'
import { embedding } from '../lib/ai/embedding/embedding'
import { MemoResult } from './model'

const appDataPath = app.getPath('userData')
const memoPath = join(appDataPath, 'memo')
let db: Connection | null = null

async function connectDB() {
  if (db) return
  db = await connect(join(memoPath))
}

mkdirSync(memoPath, { recursive: true })

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
  const db = JSONSyncPreset<{
    [id: string]: {
      content: string
      indexes: string[]
      fileName: string
    }
  }>(path, {})
  data.forEach((d) => {
    db.data[d.id] = {
      content: d.content,
      fileName: d.fileName,
      indexes: d.indexes
    }
  })
  db.write()
}

export async function saveIndex(
  memoId: string,
  data: {
    id: string
    vectors: Float32Array[]
  }[]
) {
  await connectDB()
  const tables = await db!.tableNames()
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
    await db!.createTable(memoId, tableData)
    return
  }
  const table = await db!.openTable(memoId)
  table.add(data)
}

export async function getData(data: { id: string; content: string }): Promise<Array<MemoResult>> {
  await connectDB()
  const tables = await db!.tableNames()
  if (!tables.includes(data.id)) {
    return []
  }
  const table = await db!.openTable(data.id)
  const indexes = await embedding(data.content)
  const result = (await table
    .search(Array.from(indexes.map((index) => Number(index))))
    .limit(20)
    .execute()) as {
    id: string
  }[]
  const path = join(memoPath, data.id)
  const fileDB = JSONSyncPreset<{
    [id: string]: {
      content: string
      indexes: string[]
      fileName: string
    }
  }>(path, {})
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

export async function deleteDataAndIndex(memoId: string) {
  // delete memo data file
  const path = join(memoPath, memoId)
  existsSync(path) && unlinkSync(path)
  // delete memo indexes table
  await connectDB()
  const tables = await db!.tableNames()
  if (tables.includes(memoId)) {
    await db!.dropTable(memoId)
  }
}
