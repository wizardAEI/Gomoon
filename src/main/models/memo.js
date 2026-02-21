// TODO: db.data = xxx and db.write() -> db.update(data => data = xxx )
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { app } from 'electron';
import { JSONFileSyncPreset } from 'lowdb/node';
import { connect } from 'vectordb';
import { embedding, getEmbeddingModel } from '../lib/ai/embedding/embedding';
import { postMsgToMainWindow } from '../window';
const appDataPath = app.getPath('userData');
const memoPath = join(appDataPath, 'memo');
let dbl = null;
async function connectDB() {
    if (dbl)
        return;
    dbl = await connect(join(memoPath));
}
mkdirSync(memoPath, { recursive: true });
export function saveData(memoId, data) {
    const path = join(memoPath, memoId);
    const db = JSONFileSyncPreset(path, {});
    data.forEach((d) => {
        db.data[d.id] = {
            content: d.content,
            fileName: d.fileName,
            indexes: d.indexes
        };
    });
    db.write();
}
export async function deleteDataAndIndex(memoId) {
    // delete memo data file
    const path = join(memoPath, memoId);
    existsSync(path) && unlinkSync(path);
    // delete memo indexes table
    await connectDB();
    const tables = await dbl.tableNames();
    if (tables.includes(memoId)) {
        await dbl.dropTable(memoId);
    }
}
export async function saveIndexes(memoId, data) {
    await connectDB();
    const tables = await dbl.tableNames();
    if (!tables.includes(memoId)) {
        const tableData = data.reduce((arr, item) => {
            return arr.concat(item.vectors.map((vector) => ({
                id: item.id,
                vector: vector
            })));
        }, []);
        await dbl.createTable(memoId, tableData);
        return;
    }
    const table = await dbl.openTable(memoId);
    table.add(data);
}
export async function importDataAndIndexes(memoId, data) {
    const path = join(memoPath, memoId);
    const db = JSONFileSyncPreset(path, data);
    await deleteDataAndIndex(memoId);
    const indexes = {};
    for (let i = 0; i < Object.keys(data).length; i++) {
        const key = Object.keys(data)[i];
        const item = data[key];
        for (let j = 0; j < item.indexes.length; j++) {
            if (item.vectors?.[j] && item.embeddingModel === getEmbeddingModel()) {
                indexes[key] ? indexes[key]?.push(item.vectors[j]) : (indexes[key] = [item.vectors[j]]);
                continue;
            }
            const v = await embedding(item.indexes[j]);
            indexes[key] ? indexes[key]?.push(v) : (indexes[key] = [v]);
        }
        postMsgToMainWindow(`progress ${((i / Object.keys(data).length) * 100).toFixed(0)}%`);
    }
    await saveIndexes(memoId, Object.keys(indexes).map((key) => ({
        id: key,
        vectors: indexes[key] ?? []
    })));
    db.write();
}
export async function getData(data) {
    await connectDB();
    const tables = await dbl.tableNames();
    if (!tables.includes(data.id)) {
        return [];
    }
    const table = await dbl.openTable(data.id);
    const indexes = await embedding(data.content);
    const result = (await table
        .search(Array.from(indexes.map((index) => Number(index))))
        .limit(20)
        .execute());
    const path = join(memoPath, data.id);
    const fileDB = JSONFileSyncPreset(path, {});
    const contents = [];
    result.forEach((item) => {
        if (contents.find((c) => c.content === fileDB.data[item.id]?.content) || contents.length >= 4)
            return;
        contents.push({
            content: fileDB.data[item.id]?.content || ''
        });
    });
    return contents;
}
export async function getMemoDataAndIndexes(memoId) {
    const path = join(memoPath, memoId);
    const jsonDb = JSONFileSyncPreset(path, {});
    const arr = [];
    for (const key in jsonDb.data) {
        await connectDB();
        const tables = await dbl.tableNames();
        if (!tables.includes(memoId)) {
            return [];
        }
        const table = await dbl.openTable(memoId);
        const res = await table.filter(`id = '${key}'`).execute();
        arr.push({
            id: key,
            name: jsonDb.data[key].fileName,
            data: jsonDb.data[key].content,
            vectors: res.map((item) => item.vector),
            indexes: jsonDb.data[key].indexes,
            embeddingModel: getEmbeddingModel()
        });
    }
    return arr;
}
