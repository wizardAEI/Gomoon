import { createStore } from 'solid-js/store';
import { cloneDeep } from 'lodash';
import { answerStore, setAnswerStore } from './answer';
import { userData } from './user';
import { msgs, setMsgs } from './chat';
export const [collections, setCollections] = createStore([]);
export async function loadCollection() {
    const res = await window.api.getCollections();
    setCollections(res);
    return collections;
}
function getAnsContents(id) {
    return [
        {
            id,
            assistantId: userData.selectedAssistantForAns,
            type: 'ans',
            role: 'question',
            content: answerStore.question
        },
        {
            id,
            assistantId: userData.selectedAssistantForAns,
            type: 'ans',
            role: 'ans',
            content: answerStore.answer
        }
    ];
}
function getChatContents(id) {
    const index = msgs.findIndex((m) => m.id === id);
    return [
        {
            id,
            assistantId: userData.selectedAssistantForChat,
            type: 'chat',
            role: 'human',
            content: msgs[index - 1].content
        },
        {
            id,
            assistantId: userData.selectedAssistantForChat,
            type: 'chat',
            role: 'ai',
            content: msgs[index].content
        }
    ];
}
export async function createCollection(name, id, type) {
    if (type === 'ans') {
        await window.api.createCollection({
            name,
            contents: [getAnsContents(id)]
        });
    }
    else {
        await window.api.createCollection({
            name,
            contents: [getChatContents(id)]
        });
    }
    loadCollection();
}
export async function addCollection(name, id, type) {
    const c = cloneDeep(collections.find((c) => c.name === name));
    if (!c) {
        return;
    }
    if (type === 'ans') {
        c.contents.push(getAnsContents(id));
    }
    else {
        c.contents.push(getChatContents(id));
    }
    await window.api.updateCollection(c);
    loadCollection();
}
export async function updateCollection(id, index) {
    const c = cloneDeep(collections.find((c) => c.id === id));
    if (c) {
        c.contents.splice(index, 1);
        await window.api.updateCollection(c);
    }
    loadCollection();
}
export async function removeCollection(id) {
    await window.api.deleteCollection(id);
    loadCollection();
}
export async function StickTop(id) {
    await window.api.stickTopCollection(id);
    loadCollection();
}
export async function witchToChat(c) {
    if (c[0].type === 'ans') {
        setAnswerStore('question', c[0].content);
        setAnswerStore('answer', c[1].content);
    }
    else {
        setMsgs(c.map((item) => ({
            id: item.id,
            role: item.role,
            content: item.content
        })));
    }
}
