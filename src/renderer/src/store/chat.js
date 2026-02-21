import { ErrorDict } from '@renderer/lib/constant';
import { chatAssistant } from '@renderer/lib/ai/langchain';
import { createStore, produce } from 'solid-js/store';
import { ulid } from 'ulid';
import { cloneDeep } from 'lodash';
import { extractMeta } from '@renderer/lib/ai/parseString';
import { createEffect } from 'solid-js';
import { assistants } from './assistants';
import { consumedToken, setConsumedTokenForChat } from './input';
import { userData } from './user';
export const [msgMeta, setMsgMeta] = createStore({
    id: ulid(),
    ...JSON.parse(localStorage.getItem('chat_meta') || '{}')
});
const [msgs, setMsgs] = createStore(localStorage.getItem('chat_msgs') ? JSON.parse(localStorage.getItem('chat_msgs')) : []);
createEffect(() => {
    localStorage.setItem('chat_meta', JSON.stringify(msgMeta));
    localStorage.setItem('chat_msgs', JSON.stringify(msgs));
});
let trash;
function initTrash() {
    trash = {
        msgs: [],
        consumedToken: 0
    };
}
initTrash();
const abortMap = new Map();
export function pushMsg(msg) {
    initTrash();
    setMsgs(produce((msgs) => {
        msgs.push(msg);
    }));
}
export function clearMsgs() {
    if (!msgs.length)
        return;
    trash = {
        msgs: cloneDeep(msgs),
        consumedToken: consumedToken().chat
    };
    setMsgs([]);
    setMsgMeta('id', ulid());
    setConsumedTokenForChat(0);
}
export function removeMsg(id) {
    trash = {
        msgs: cloneDeep(msgs),
        consumedToken: consumedToken().chat
    };
    const index = msgs.findIndex((item) => item.id === id);
    setMsgs(produce((msgs) => {
        msgs.splice(index, 2);
    }));
}
export function restoreMsgs() {
    if (!trash.msgs.length)
        return;
    setMsgs(trash.msgs);
    setConsumedTokenForChat(trash.consumedToken);
    initTrash();
}
export function editMsg(msg, id) {
    setMsgs(produce((msgs) => {
        const index = msgs.findIndex((item) => item.id === id);
        msgs[index] = { ...msgs[index], ...msg };
    }));
}
export function editMsgByAdd(content, id) {
    setMsgs(produce((msgs) => {
        const index = msgs.findIndex((item) => item.id === id);
        msgs[index].content += content;
    }));
}
const [msgStatus, setMsgStatus] = createStore({
    generatingList: []
});
export function pushGeneratingStatus(existID) {
    const id = existID || ulid();
    setMsgStatus(produce((msgStatus) => {
        msgStatus.generatingList.push(id);
    }));
    return id;
}
export function removeGeneratingStatus(id) {
    setMsgStatus(produce((msgStatus) => {
        msgStatus.generatingList = msgStatus.generatingList.filter((item) => item !== id);
    }));
}
export function isGenerating(id) {
    return msgStatus.generatingList.includes(id);
}
export function reActiveGeneratingStatus(id) {
    setMsgStatus(produce((msgStatus) => {
        msgStatus.generatingList.push(id);
    }));
}
export async function genMsg(id) {
    const currentMsgs = msgs.slice(0, msgs.findIndex((msg) => msg.id === id));
    const controller = new AbortController();
    abortMap.set(id, () => controller.abort());
    try {
        await chatAssistant(currentMsgs.map((m, i) => ({
            ...m,
            content: extractMeta(m.content, i === currentMsgs.length - 1)
        })), {
            newTokenCallback(content) {
                editMsgByAdd(content, id);
            },
            endCallback(res) {
                const consumedToken = res.llmOutput?.estimatedTokenUsage?.totalTokens ??
                    res.llmOutput?.tokenUsage?.totalTokens ??
                    0;
                setConsumedTokenForChat(consumedToken);
                removeGeneratingStatus(id);
            },
            errorCallback(err) {
                editMsgByAdd(ErrorDict(err), id);
                removeGeneratingStatus(id);
            },
            pauseSignal: controller.signal
        });
    }
    catch (err) {
        if (!isGenerating(id))
            return;
        editMsgByAdd(ErrorDict(err), id);
    }
    finally {
        removeGeneratingStatus(id);
        abortMap.delete(id);
    }
}
export async function stopGenMsg(id) {
    window.api.stopLLM();
    abortMap.get(id)?.();
    abortMap.delete(id);
    // 1s 后强制终止状态，防止网络原因无法终止
    setTimeout(() => removeGeneratingStatus(id), 1000);
    // 自行计算token消费
    const currentMsgs = msgs.reduce((acc, msg) => {
        acc += msg.content;
        return acc;
    }, '');
    const systemContent = assistants.find((assistant) => assistant.id === userData.selectedAssistantForChat)?.prompt;
    setConsumedTokenForChat(await window.api.getTokenNum(systemContent + currentMsgs));
}
export { msgs, setMsgs, msgStatus };
