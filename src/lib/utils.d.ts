export declare const newChatLlamaForNode: (config: {
    src: string;
    temperature: number;
}) => Promise<import("@langchain/community/chat_models/llama_cpp").ChatLlamaCpp | {
    invoke(): never;
    stream(): never;
}>;
