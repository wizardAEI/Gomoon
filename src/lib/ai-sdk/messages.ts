/**
 * Message format conversion: ChatMessage (langchain compatible) <-> AI-SDK CoreMessage
 */
import type { ChatMessage, MessageContent } from './types'

/** AI-SDK message format */
export type AIMessage = { role: 'system'; content: string } | { role: 'user'; content: string | Array<{ type: 'text'; text: string } | { type: 'image'; image: string | URL; mimeType?: string }> } | { role: 'assistant'; content: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function contentToAISDK(content: MessageContent): string | Array<{ type: 'text'; text: string } | { type: 'image'; image: string; mimeType?: string }> {
  if (typeof content === 'string') {
    return content
  }
  const parts: Array<{ type: 'text'; text: string } | { type: 'image'; image: string; mimeType?: string }> = []
  for (const part of content) {
    const p = part as { type: string; text?: string; image_url?: { url: string } }
    if (p.type === 'text' && p.text) {
      parts.push({ type: 'text', text: p.text })
    } else if (p.type === 'image_url' && p.image_url?.url) {
      parts.push({ type: 'image', image: p.image_url.url })
    }
  }
  if (parts.length === 1 && parts[0].type === 'text') {
    return parts[0].text
  }
  if (parts.length === 0) return ''
  return parts
}

export function toAISDKMessages(messages: ChatMessage[]): AIMessage[] {
  return messages.map((msg) => {
    const role = msg.role === 'human' ? 'user' : msg.role === 'ai' ? 'assistant' : 'system'
    const content = contentToAISDK(msg.content)
    return { role, content } as AIMessage
  })
}
