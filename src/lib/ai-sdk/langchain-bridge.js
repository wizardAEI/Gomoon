/**
 * Bridge: wraps LangChain models (Baidu, Ollama, Llama) to LLMAdapter interface
 */
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
function contentToString(content) {
    if (typeof content === 'string')
        return content;
    const arr = content;
    return arr.map((c) => (c.type === 'text' && c.text ? c.text : '')).join('');
}
function toLangChainMessages(messages) {
    return messages.map((msg) => {
        const content = msg.content;
        if (msg.role === 'system') {
            return new SystemMessage(contentToString(content));
        }
        if (msg.role === 'ai') {
            return new AIMessage(contentToString(content));
        }
        return new HumanMessage({ content: content });
    });
}
export function createLangChainBridge(lcModel) {
    return {
        async streamInvoke(messages, options) {
            const lcMsgs = toLangChainMessages(messages);
            try {
                const res = await lcModel.invoke(lcMsgs, {
                    signal: options.signal,
                    callbacks: [
                        {
                            handleLLMNewToken(token) {
                                options.onToken?.(token);
                            },
                            handleLLMError(err) {
                                options.onError?.(err);
                            }
                        }
                    ]
                });
                const content = typeof res?.content === 'string' ? res.content : '';
                options.onEnd?.({ content, generations: [] });
                return { content, generations: [] };
            }
            catch (err) {
                options.onError?.(err);
                throw err;
            }
        },
        async invoke(messages) {
            const lcMsgs = toLangChainMessages(messages);
            const res = await lcModel.invoke(lcMsgs);
            const content = typeof res?.content === 'string' ? res.content : '';
            return { content, generations: [] };
        }
    };
}
