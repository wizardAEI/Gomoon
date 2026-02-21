import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
/** 获取模型展示信息 */
export function getModelInfo(modelId, enabledModels) {
    const em = enabledModels.find((m) => m.id === modelId);
    if (em) {
        return {
            label: em.label || em.modelId,
            maxToken: em.maxToken ?? 128000
        };
    }
    return { label: modelId, maxToken: 128000 };
}
export const defaultModels = () => ({
    providers: [],
    enabledModels: []
});
export const msgDict = {
    human: (c) => new HumanMessage({
        content: c
    }),
    system: (c) => new SystemMessage({
        content: c
    }),
    ai: (c) => new AIMessage({
        content: c
    })
};
