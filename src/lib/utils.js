import { existsSync } from 'fs';
export const newChatLlamaForNode = async (config) => {
    const { ChatLlamaCpp } = await import('@langchain/community/chat_models/llama_cpp');
    // 检查模型文件是否存在
    if (!config.src || !existsSync(config.src)) {
        return {
            invoke() {
                throw new Error('Llama model not found');
            },
            stream() {
                throw new Error('Llama model not found');
            }
        };
    }
    return new ChatLlamaCpp({
        modelPath: config.src,
        temperature: config.temperature,
        gpuLayers: 64
    });
};
