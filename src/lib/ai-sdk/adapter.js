/**
 * Wraps AI-SDK streamText/generateText to LLMAdapter interface
 */
import { streamText, generateText } from 'ai';
import { toAISDKMessages } from './messages';
export function createAIAdapter(model, settings) {
    return {
        async streamInvoke(messages, options) {
            const aiMessages = toAISDKMessages(messages);
            const systemMsg = aiMessages.find((m) => m.role === 'system');
            const otherMsgs = aiMessages.filter((m) => m.role !== 'system');
            try {
                const result = streamText({
                    model,
                    system: systemMsg?.role === 'system' ? systemMsg.content : undefined,
                    messages: otherMsgs,
                    abortSignal: options.signal,
                    temperature: settings?.temperature
                });
                let fullText = '';
                let needsReasoningLinePrefix = true;
                for await (const chunk of result.fullStream) {
                    if (chunk.type === 'text-delta' && chunk.text) {
                        fullText += chunk.text;
                        options.onToken?.(chunk.text);
                    }
                    if (chunk.type === 'reasoning-delta' && chunk.text) {
                        const text = chunk.text;
                        let output = text;
                        if (needsReasoningLinePrefix) {
                            output = '> ' + output;
                            needsReasoningLinePrefix = false;
                        }
                        output = output.replaceAll('\n', '\n> ');
                        needsReasoningLinePrefix = text.endsWith('\n');
                        options.onToken?.(output);
                    }
                }
                const usage = await result.usage;
                const output = {
                    content: fullText,
                    generations: [],
                    llmOutput: usage
                        ? {
                            tokenUsage: { totalTokens: usage.totalTokens },
                            estimatedTokenUsage: { totalTokens: usage.totalTokens }
                        }
                        : undefined
                };
                options.onEnd?.(output);
                return output;
            }
            catch (err) {
                options.onError?.(err);
                throw err;
            }
        },
        async invoke(messages) {
            const aiMessages = toAISDKMessages(messages);
            const systemMsg = aiMessages.find((m) => m.role === 'system');
            const otherMsgs = aiMessages.filter((m) => m.role !== 'system');
            const result = await generateText({
                model,
                system: systemMsg?.role === 'system' ? systemMsg.content : undefined,
                messages: otherMsgs,
                temperature: settings?.temperature
            });
            const usage = result.usage;
            return {
                content: result.text ?? '',
                generations: [],
                llmOutput: usage
                    ? {
                        tokenUsage: { totalTokens: usage.totalTokens },
                        estimatedTokenUsage: { totalTokens: usage.totalTokens }
                    }
                    : undefined
            };
        }
    };
}
