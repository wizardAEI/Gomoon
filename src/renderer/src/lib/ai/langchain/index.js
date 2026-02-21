import { userData } from '@renderer/store/user';
import { getCurrentAssistantForAnswer, getCurrentAssistantForChat } from '@renderer/store/assistants';
import { models } from './models';
const createModelAdapter = (model) => {
    return {
        async answer(msg, option) {
            const msgs = [
                { role: 'system', content: msg.systemTemplate },
                { role: 'human', content: msg.humanTemplate }
            ];
            return model.streamInvoke(msgs, {
                signal: option.pauseSignal,
                onToken: option.newTokenCallback,
                onEnd: option.endCallback,
                onError: option.errorCallback
            });
        },
        async chat(msgs, option) {
            const chatMsgs = msgs.map((msg) => ({
                role: msg.role,
                content: msg.content || '...'
            }));
            return model.streamInvoke(chatMsgs, {
                onToken: option.newTokenCallback,
                onEnd: option.endCallback,
                onError: option.errorCallback,
                signal: option.pauseSignal
            });
        }
    };
};
/**
 * FEAT: Answer Assistant
 */
export const ansAssistant = async (option) => {
    const a = getCurrentAssistantForAnswer();
    const question = option.question;
    if (a.type === 'ans' && a.prompts?.length) {
        // TODO: 支持和prompts进行结合得出最终的question
    }
    const model = models[userData.selectedModel];
    if (!model)
        throw new Error(`模型 ${userData.selectedModel} 未找到`);
    return createModelAdapter(model).answer({
        systemTemplate: a.prompt,
        humanTemplate: question
    }, option);
};
/**
 * FEAT: Chat Assistant
 */
export const chatAssistant = async (msgs, option) => {
    const model = models[userData.selectedModel];
    if (!model)
        throw new Error(`模型 ${userData.selectedModel} 未找到`);
    return createModelAdapter(model).chat([
        {
            role: 'system',
            content: getCurrentAssistantForChat().prompt
        },
        ...msgs
    ], option);
};
export const nonStreamingAssistant = async (question) => {
    const model = models[userData.selectedModel];
    if (!model)
        throw new Error(`模型 ${userData.selectedModel} 未找到`);
    const result = await model.invoke([
        { role: 'human', content: question }
    ]);
    return { content: result.content };
};
