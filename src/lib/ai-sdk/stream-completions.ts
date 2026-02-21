/**
 * 直接调用 /chat/completions 接口进行流式生成
 * 适用于 OpenAI 兼容的 API
 */
import type { ChatMessage, GenerateResult } from './types'
import { toAISDKMessages } from './messages'

export interface ChatCompletionsOptions {
  baseURL: string
  apiKey: string
  modelId: string
  temperature?: number
  signal?: AbortSignal
}

export interface StreamOptions {
  onToken?: (token: string) => void
  onEnd?: (output: GenerateResult) => void
  onError?: (err: unknown) => void
}

function toOpenAIMessages(messages: ChatMessage[]): Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> {
  const aiMsgs = toAISDKMessages(messages)
  return aiMsgs.map((m) => {
    if (typeof m.content === 'string') {
      return { role: m.role, content: m.content }
    }
    return {
      role: m.role,
      content: m.content.map((p) =>
        p.type === 'text'
          ? { type: 'text' as const, text: p.text }
          : { type: 'image_url' as const, image_url: { url: typeof p.image === 'string' ? p.image : p.image.toString() } }
      )
    }
  })
}

function normalizeBaseURL(baseURL: string): string {
  return baseURL.replace(/\/$/, '')
}

/**
 * 流式调用 POST {baseURL}/chat/completions
 */
export async function streamChatCompletions(
  messages: ChatMessage[],
  options: ChatCompletionsOptions & StreamOptions
): Promise<GenerateResult | null> {
  const { baseURL, apiKey, modelId, temperature, signal, onToken, onEnd, onError } = options
  const url = `${normalizeBaseURL(baseURL)}/chat/completions`

  const body = {
    model: modelId,
    messages: toOpenAIMessages(messages),
    stream: true,
    ...(typeof temperature === 'number' && { temperature })
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey || 'ollama'}`
      },
      body: JSON.stringify(body),
      signal
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`chat/completions failed: ${res.status} ${res.statusText}\n${text}`)
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const json = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string; reasoning_content?: string }; finish_reason?: string }>
            usage?: { total_tokens?: number }
          }
          const choice = json.choices?.[0]?.delta
          if (!choice) continue

          // reasoning_content（如 DeepSeek R1）— 仅透传 onToken，不计入 fullText
          if (choice.reasoning_content) {
            const t = choice.reasoning_content
            onToken?.('> ')
            onToken?.(t.includes('\n') ? t.replaceAll('\n', '\n> ') : t)
          }
          if (choice.content) {
            onToken?.(choice.content)
            fullText += choice.content
          }
        } catch {
          // 非 JSON 行忽略
        }
      }
    }

    const output: GenerateResult = {
      content: fullText,
      generations: [],
      llmOutput: undefined
    }
    onEnd?.(output)
    return output
  } catch (err) {
    onError?.(err)
    throw err
  }
}

/**
 * 非流式调用 POST {baseURL}/chat/completions
 */
export async function chatCompletions(
  messages: ChatMessage[],
  options: ChatCompletionsOptions
): Promise<GenerateResult> {
  const { baseURL, apiKey, modelId, temperature, signal } = options
  const url = `${normalizeBaseURL(baseURL)}/chat/completions`

  const body = {
    model: modelId,
    messages: toOpenAIMessages(messages),
    stream: false,
    ...(typeof temperature === 'number' && { temperature })
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey || 'ollama'}`
    },
    body: JSON.stringify(body),
    signal
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`chat/completions failed: ${res.status} ${res.statusText}\n${text}`)
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
    usage?: { total_tokens?: number }
  }
  const content = json.choices?.[0]?.message?.content ?? ''

  return {
    content,
    generations: [],
    llmOutput: json.usage?.total_tokens
      ? { tokenUsage: { totalTokens: json.usage.total_tokens }, estimatedTokenUsage: { totalTokens: json.usage.total_tokens } }
      : undefined
  }
}
