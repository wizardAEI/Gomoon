/**
 * AI-SDK adapter layer - unified types
 * Compatible with existing MessageContent usage from LangChain
 */

/** Content can be string or array of text/image parts (LangChain compatible) */
export type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >

export type Roles = 'human' | 'system' | 'ai'

export interface ChatMessage {
  role: Roles
  content: MessageContent
}

/** Result shape compatible with LLMResult / BaseMessageChunk */
export interface GenerateResult {
  content: string
  generations?: unknown[]
  /** Token usage from AI-SDK / LangChain */
  llmOutput?: {
    tokenUsage?: { totalTokens?: number }
    estimatedTokenUsage?: { totalTokens?: number }
  }
}

/** Unified LLM adapter interface - supports both AI-SDK and LangChain (bridge) */
export interface LLMAdapter {
  /** Stream chat with callbacks */
  streamInvoke(
    messages: ChatMessage[],
    options: {
      onToken?: (token: string) => void
      onEnd?: (output: GenerateResult) => void
      onError?: (err: unknown) => void
      signal?: AbortSignal
    }
  ): Promise<GenerateResult | null>

  /** Non-streaming generate */
  invoke(messages: ChatMessage[]): Promise<GenerateResult>
}
