// eslint-disable-next-line @typescript-eslint/no-explicit-any
function contentToAISDK(content) {
    if (typeof content === 'string') {
        return content;
    }
    const parts = [];
    for (const part of content) {
        const p = part;
        if (p.type === 'text' && p.text) {
            parts.push({ type: 'text', text: p.text });
        }
        else if (p.type === 'image_url' && p.image_url?.url) {
            parts.push({ type: 'image', image: p.image_url.url });
        }
    }
    if (parts.length === 1 && parts[0].type === 'text') {
        return parts[0].text;
    }
    if (parts.length === 0)
        return '';
    return parts;
}
export function toAISDKMessages(messages) {
    return messages.map((msg) => {
        const role = msg.role === 'human' ? 'user' : msg.role === 'ai' ? 'assistant' : 'system';
        const content = contentToAISDK(msg.content);
        return { role, content };
    });
}
