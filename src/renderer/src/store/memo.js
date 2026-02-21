import { createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { cloneDeep } from 'lodash';
import { userData } from './user';
const [memories, setMemories] = createStore([]);
const [memoriesStatus, setMemoriesStatus] = createStore({});
export async function loadMemories() {
    setMemories(await window.api.getMemories());
    setMemoriesStatus(memories.reduce((a, b) => ({ ...a, [b.id]: 'saved' }), {}));
    setMemoriesStatus({
        ...memoriesStatus,
        creating: 'creating'
    });
}
export async function initMemories() {
    await window.api.initMemories();
    await loadMemories();
}
export const getCurrentMemo = createMemo(() => {
    return (memories.find((a) => a.id === userData.selectedMemo) || {
        id: 'default',
        name: '暂无记忆',
        version: 0,
        introduce: '',
        fragment: []
    });
});
export function createNewMemo() {
    if (memories.findIndex((m) => m.id === 'creating') !== -1)
        return;
    const newM = {
        id: 'creating',
        name: '',
        version: 1,
        introduce: '',
        fragment: []
    };
    setMemories(produce((a) => {
        a.unshift(newM);
    }));
}
export async function onEditMemo(id) {
    await window.api.editMemory(id, cloneDeep(memories.find((m) => m.id === id)?.fragment) || []);
    setMemoriesStatus(produce((m) => {
        m[id] = 'editing';
    }));
}
export function onCancelEditMemo(id) {
    window.api.cancelSaveMemory(id);
    if (id === 'creating') {
        setMemories(produce((m) => {
            m.shift();
        }));
    }
    else {
        setMemoriesStatus(produce((m) => {
            m[id] = 'saved';
        }));
    }
}
export async function saveMemo(m) {
    await window.api.saveMemory(cloneDeep(m));
    setMemories(produce((memo) => {
        memo.shift();
    }));
    loadMemories();
}
export async function useMemo(id) {
    await window.api.useMemory(id);
    await loadMemories();
}
export async function deleteMemo(id) {
    await window.api.deleteMemory(id);
    loadMemories();
}
export async function importMemo(path) {
    if (!(await window.api.importMemory(path))) {
        return false;
    }
    loadMemories();
    return true;
}
export { memories, memoriesStatus };
