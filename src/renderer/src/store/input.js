import { createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { getModelInfo } from '@lib/langchain';
import { settingStore } from './setting';
import { userData } from './user';
const [inputStore, setInputStore] = createStore({
    isNetworking: false,
    memoCapsule: false,
    inputText: '',
    consumedToken: {
        ans: 0,
        chat: 0
    }
});
export function setNetworkingStatus(status) {
    setInputStore('isNetworking', status);
}
export const isNetworking = createMemo(() => {
    if (userData.selectedModel === 'ERNIE4') {
        return false;
    }
    return inputStore.isNetworking;
});
export const memoCapsule = createMemo(() => {
    return inputStore.memoCapsule;
});
export function setMemoCapsule(status) {
    setInputStore('memoCapsule', status);
}
export function setInputText(text) {
    setInputStore('inputText', text);
}
export const inputText = createMemo(() => {
    return inputStore.inputText ?? '';
});
export const tokens = createMemo(() => {
    function parseNum(num) {
        if (num < 1000) {
            return num;
        }
        return `${Math.floor(num / 1000)}k`;
    }
    const info = getModelInfo(userData.selectedModel, settingStore.models.enabledModels);
    return {
        maxToken: parseNum(info.maxToken),
        consumedTokenForChat: (plusNum) => parseNum(inputStore.consumedToken.chat + plusNum),
        consumedTokenForAns: (plusNum) => parseNum(inputStore.consumedToken.ans + plusNum)
    };
});
export const consumedToken = createMemo(() => {
    return inputStore.consumedToken;
});
export function setConsumedTokenForChat(token) {
    setInputStore('consumedToken', 'chat', token);
}
export function setConsumedTokenForAns(token) {
    setInputStore('consumedToken', 'ans', token);
}
