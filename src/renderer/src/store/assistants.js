import { createStore, produce } from 'solid-js/store';
import { createMemo } from 'solid-js';
import { cloneDeep } from 'lodash';
import { getRandomString } from '@renderer/lib/util';
import { changeMatchModel, userData } from './user';
const [assistants, setAssistants] = createStore([]);
const [assistantsStatus, setAssistantsStatus] = createStore({});
export async function loadAssistants() {
    setAssistants(await window.api.getAssistants());
    setAssistantsStatus(assistants.reduce((a, b) => ({ ...a, [b.id]: 'saved' }), {}));
    setAssistantsStatus({
        ...assistantsStatus,
        creating: 'creating'
    });
}
export function createNewAssistant(type) {
    if (assistants.findIndex((a) => a.id === 'creating') !== -1)
        return;
    const newA = {
        type,
        id: 'creating',
        avatar: getRandomString(5),
        name: '',
        version: 1,
        prompt: ''
    };
    setAssistants(produce((a) => {
        a.unshift(newA);
    }));
}
export function onEditAssistant(id) {
    if (id === 'creating')
        return;
    setAssistantsStatus(produce((a) => {
        a[id] = 'editing';
    }));
}
export function onCancelEditAssistant(id) {
    if (id === 'creating') {
        setAssistants(produce((a) => {
            a.shift();
        }));
    }
    else {
        setAssistantsStatus(produce((a) => {
            a[id] = 'saved';
        }));
    }
}
export async function saveAssistant(a) {
    if (a.id === 'creating') {
        await window.api.createAssistant(cloneDeep(a));
        setAssistants(produce((as) => {
            as.shift();
        }));
    }
    else {
        await window.api.updateAssistant(cloneDeep(a));
    }
    loadAssistants();
}
export async function deleteAssistant(id) {
    await window.api.deleteAssistant(id);
    loadAssistants();
}
export async function useAssistant(id) {
    await window.api.useAssistant(id);
    await loadAssistants();
    const currentA = assistants.find((a) => a.id === id);
    changeMatchModel(currentA?.matchModel, id);
}
export const getCurrentAssistantForAnswer = createMemo(() => {
    return (assistants.find((a) => a.id === userData.selectedAssistantForAns) || {
        type: 'ans',
        id: 'default',
        name: '暂无助手',
        introduce: '',
        prompt: '',
        version: 0
    });
});
export const getCurrentAssistantForChat = createMemo(() => assistants.find((a) => a.id === userData.selectedAssistantForChat) || {
    type: 'chat',
    id: 'default',
    name: '暂无助手',
    prompt: '',
    version: 0
});
export const exportAssistants = async () => {
    const json = JSON.stringify(assistants);
    await window.api.saveFile('assistants.json', json);
};
export const importAssistants = async (content) => {
    try {
        const importA = JSON.parse(content);
        if (!Array.isArray(importA))
            return false;
        // eslint-disable-next-line solid/reactivity
        importA.forEach(async (a) => {
            if (typeof a.id === 'string' &&
                typeof a.name === 'string' &&
                typeof a.prompt === 'string' &&
                (a.type === 'ans' || a.type === 'chat') &&
                typeof a.version === 'number') {
                const curA = assistants.find((as) => as.id === a.id);
                if (curA && curA.version >= a.version)
                    return;
                await saveAssistant(a);
            }
            else {
                throw new Error('invalid assistant');
            }
        });
        return true;
    }
    catch (e) {
        return false;
    }
};
export { assistants, assistantsStatus };
