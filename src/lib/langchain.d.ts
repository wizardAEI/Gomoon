import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import type { MessageContent } from '@langchain/core/messages';
import type { ModelsConfig, Provider, EnabledModel } from './models-config';
export type { ModelsConfig, Provider, EnabledModel };
/** 兼容旧代码的 ModelsType - 现为 EnabledModel.id */
export type ModelsType = string;
/** 获取模型展示信息 */
export declare function getModelInfo(modelId: string, enabledModels: EnabledModel[]): {
    label: string;
    maxToken: number;
};
export declare const defaultModels: () => ModelsConfig;
export declare const msgDict: {
    [key in 'human' | 'system' | 'ai']: (c: MessageContent) => HumanMessage | SystemMessage | AIMessage;
};
