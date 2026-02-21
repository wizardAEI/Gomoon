import { createStore } from 'solid-js/store';
import { createMemo } from 'solid-js';
import { assistants, useAssistant } from './assistants';
import { memories, useMemo } from './memo';
/**
 * @abstract 所有不在设置页面的数据
 */
/**
 * FEAT: Lines
 */
const [lines, setLines] = createStore([]);
export async function loadLines() {
    const l = await window.api.getLines();
    setLines(l.map((line) => ({ from: 'Gomoon', content: '快速双击复制，可以直接进入问答模式', ...line })));
}
export const currentLines = createMemo(() => {
    return lines;
});
const [userData, setUserData] = createStore({
    firstTime: true,
    selectedModel: '',
    selectedAssistantForAns: '',
    selectedAssistantForChat: '',
    selectedMemo: '',
    firstTimeFor: {
        modelSelect: true,
        assistantSelect: true
    },
    windowSize: {
        width: 0,
        height: 0
    }
});
export const [userState, setUserState] = createStore({
    preSelectedAssistant: ''
});
export async function loadUserData() {
    setUserData(await window.api.getUserData());
    loadLines();
}
export function userHasUse() {
    window.api.setUserData({
        firstTime: false
    });
}
export function changeMatchModel(model, id) {
    if (model && model !== 'current') {
        window.api
            .setUserData({
            selectedModel: model
        })
            .then(() => {
            setUserData('selectedModel', model);
        });
    }
    setUserState('preSelectedAssistant', id);
}
export function setSelectedModel(model) {
    window.api
        .setUserData({
        selectedModel: model
    })
        .then(() => {
        setUserData('selectedModel', model);
    });
}
export async function setSelectedAssistantForAns(assistantID) {
    if (assistants.findIndex((item) => item.id === assistantID) === -1) {
        return;
    }
    setUserData('selectedAssistantForAns', assistantID);
    await useAssistant(assistantID);
    return window.api.setUserData({
        selectedAssistantForAns: assistantID
    });
}
export async function setSelectedAssistantForChat(assistantID) {
    if (assistants.findIndex((item) => item.id === assistantID) === -1) {
        return;
    }
    setUserData('selectedAssistantForChat', assistantID);
    await useAssistant(assistantID);
    return window.api.setUserData({
        selectedAssistantForChat: assistantID
    });
}
export async function setSelectedMemo(memoID) {
    if (memories.findIndex((item) => item.id === memoID) === -1) {
        return;
    }
    setUserData('selectedMemo', memoID);
    await useMemo(memoID);
    return window.api.setUserData({
        selectedMemo: memoID
    });
}
export async function hasFirstTimeFor(key) {
    setUserData('firstTimeFor', {
        ...userData.firstTimeFor,
        [key]: false
    });
    await window.api.setUserData({
        firstTimeFor: {
            [key]: false
        }
    });
    loadUserData();
}
const [pageData, setPageData] = createStore({
    isSpeech: false
});
export { userData, pageData, setPageData };
