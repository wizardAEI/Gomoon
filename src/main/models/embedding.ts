import { app } from 'electron'
import { join } from 'path'
import { JSONSyncPreset } from 'lowdb/node'
import { connect } from 'vectordb'
import { mkdirSync } from 'fs'

const appDataPath = app.getPath('userData')
const memoPath = join(appDataPath, 'memo')
mkdirSync(memoPath, { recursive: true })
// 这里的数据文件先使用
export function saveData(
  name: string,
  data: {
    id: string
    content: string
    indexes: string[]
  }[]
) {
  const path = join(memoPath, name)
  const db = JSONSyncPreset<{
    [id: string]: {
      content: string
      indexes: string[]
    }
  }>(path, {})
  data.forEach((d) => {
    db.data[d.id] = {
      content: d.content,
      indexes: d.indexes
    }
  })
  db.write()
}

export async function saveIndex(
  name: string,
  data: {
    id: string
    vectors: Float32Array[]
  }[]
) {
  const db = await connect(join(memoPath))
  const tables = await db.tableNames()
  if (!tables.includes(name)) {
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
    console.log(tableData)
    await db.createTable(name, tableData)
    return
  }
  const table = await db.openTable(name)
  table.add(data)
}
