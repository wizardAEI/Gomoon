import { toAISDKMessages } from './messages';
function toOpenAIMessages(messages) {
    const aiMsgs = toAISDKMessages(messages);
    return aiMsgs.map((m) => {
        if (typeof m.content === 'string') {
            return { role: m.role, content: m.content };
        }
        return {
            role: m.role,
            content: m.content.map((p) => p.type === 'text'
                ? { type: 'text', text: p.text }
                : { type: 'image_url', image_url: { url: typeof p.image === 'string' ? p.image : p.image.toString() } })
        };
    });
}
function normalizeBaseURL(baseURL) {
    return baseURL.replace(/\/$/, '');
}
/**
 * 流式调用 POST {baseURL}/chat/completions
 */
export async function streamChatCompletions(messages, options) {
    const { baseURL, apiKey, modelId, temperature, signal, onToken, onEnd, onError } = options;
    const url = `${normalizeBaseURL(baseURL)}/chat/completions`;
    const body = {
        model: modelId,
        messages: toOpenAIMessages(messages),
        stream: true,
        ...(typeof temperature === 'number' && { temperature })
    };
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey || 'ollama'}`
            },
            body: JSON.stringify(body),
            signal
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`chat/completions failed: ${res.status} ${res.statusText}\n${text}`);
        }
        const reader = res.body?.getReader();
        if (!reader)
            throw new Error('No response body');
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
                if (!line.startsWith('data: '))
                    continue;
                const data = line.slice(6);
                if (data === '[DONE]')
                    continue;
                try {
                    const json = JSON.parse(data);
                    const choice = json.choices?.[0]?.delta;
                    if (!choice)
                        continue;
                    // reasoning_content（如 DeepSeek R1）— 仅透传 onToken，不计入 fullText
                    if (choice.reasoning_content) {
                        const t = choice.reasoning_content;
                        onToken?.('> ');
                        onToken?.(t.includes('\n') ? t.replaceAll('\n', '\n> ') : t);
                    }
                    if (choice.content) {
                        onToken?.(choice.content);
                        fullText += choice.content;
                    }
                }
                catch {
                    // 非 JSON 行忽略
                }
            }
        }
        const output = {
            content: fullText,
            generations: [],
            llmOutput: undefined
        };
        onEnd?.(output);
        return output;
    }
    catch (err) {
        onError?.(err);
        throw err;
    }
}
/**
 * 非流式调用 POST {baseURL}/chat/completions
 */
export async function chatCompletions(messages, options) {
    const { baseURL, apiKey, modelId, temperature, signal } = options;
    const url = `${normalizeBaseURL(baseURL)}/chat/completions`;
    const body = {
        model: modelId,
        messages: toOpenAIMessages(messages),
        stream: false,
        ...(typeof temperature === 'number' && { temperature })
    };
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey || 'ollama'}`
        },
        body: JSON.stringify(body),
        signal
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`chat/completions failed: ${res.status} ${res.statusText}\n${text}`);
    }
    const json = (await res.json());
    const content = json.choices?.[0]?.message?.content ?? '';
    return {
        content,
        generations: [],
        llmOutput: json.usage?.total_tokens
            ? { tokenUsage: { totalTokens: json.usage.total_tokens }, estimatedTokenUsage: { totalTokens: json.usage.total_tokens } }
            : undefined
    };
}
