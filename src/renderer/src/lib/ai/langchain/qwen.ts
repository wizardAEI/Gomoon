import {
  BaseChatModel,
  type BaseChatModelParams
} from '@langchain/core/language_models/chat_models'
import { AIMessage, ChatMessage } from '@langchain/core/messages'
import { getEnvironmentVariable } from '@langchain/core/utils/env'
import { BaseMessage } from '@langchain/core/messages'
import { ChatResult } from '@langchain/core/outputs'
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager'

/**
 * Type representing the role of a message in the QWen chat model.
 */
export type QWenMessageRole = 'system' | 'assistant' | 'user'
/**
 * Interface representing a message in the QWen chat model.
 */
interface QWenMessage {
  role: QWenMessageRole
  content: string
}
/**
 * Interface representing a request for a chat completion.
 */
interface ChatCompletionRequest {
  model:
    | (string & NonNullable<unknown>)
    | 'qwen-turbo'
    | 'qwen-plus'
    | 'qwen-max'
    | 'qwen-max-1201'
    | 'qwen-max-longcontext'
  input: {
    messages: QWenMessage[]
  }
  parameters: {
    stream?: boolean
    result_format?: 'text' | 'message'
    seed?: number | null
    max_tokens?: number | null
    top_p?: number | null
    top_k?: number | null
    repetition_penalty?: number | null
    temperature?: number | null
    enable_search?: boolean | null
    incremental_output?: boolean | null
  }
}
/**
 * Interface defining the input to the ChatAliQWen class.
 */
interface AliQWenChatInput {
  /** Model name to use. Available options are: qwen-turbo, qwen-max, qwen-plus
   * @default "qwen-turbo"
   */
  modelName: string
  /** Whether to stream the results or not. Defaults to false. */
  streaming?: boolean
  /** Messages to pass as a prefix to the prompt */
  prefixMessages?: QWenMessage[]
  /**
   * API key to use when making requests. Defaults to the value of
   * `ALI_API_KEY` environment variable.
   */
  aliApiKey?: string
  /** Amount of randomness injected into the response. Ranges
   * from 0 to 1 (0 is not included). Use temp closer to 0 for analytical /
   * multiple choice, and temp closer to 1 for creative
   * and generative tasks. Defaults to 0.95.
   */
  temperature?: number
  /** Total probability mass of tokens to consider at each step. Range
   * from 0 to 1.0. Defaults to 0.8.
   */
  topP?: number
  topK?: number
  /** Penalizes repeated tokens according to frequency. Range
   * from 1.0 to 2.0. Defaults to 1.0.
   */
  repetitionPenalty?: number
  enableSearch?: boolean
  maxTokens?: number
  seed?: number
}

/**
 * Function that extracts the custom role of a generic chat message.
 * @param message Chat message from which to extract the custom role.
 * @returns The custom role of the chat message.
 */
function extractGenericMessageCustomRole(message: ChatMessage) {
  if (['system', 'assistant', 'user'].includes(message.role) === false) {
    console.warn(`Unknown message role: ${message.role}`)
  }
  return message.role as QWenMessageRole
}

/**
 * Function that converts a base message to a QWen message role.
 * @param message Base message to convert.
 * @returns The QWen message role.
 */
function messageToQWenRole(message: BaseMessage): QWenMessageRole {
  const type = message._getType()
  switch (type) {
    case 'ai':
      return 'assistant'
    case 'human':
      return 'user'
    case 'system':
      return 'system'
    case 'function':
      throw new Error('Function messages not supported')
    case 'generic': {
      if (!ChatMessage.isInstance(message)) throw new Error('Invalid generic chat message')
      return extractGenericMessageCustomRole(message)
    }
    default:
      throw new Error(`Unknown message type: ${type}`)
  }
}
/**
 * Wrapper around Ali QWen large language models that use the Chat endpoint.
 *
 * To use you should have the `ALI_API_KEY`
 * environment variable set.
 *
 * @augments BaseLLM
 * @augments AliQWenInput
 * @example
 * ```typescript
 * const ernieTurbo = new ChatAliQWen({
 *   aliApiKey: "YOUR-API-KEY",
 * });
 *
 * const ernie = new ChatAliQWen({
 *   modelName: "qwen-turbo",
 *   temperature: 1,
 *   aliApiKey: "YOUR-API-KEY",
 * });
 *
 * const messages = [new HumanMessage("Hello")];
 *
 * let res = await ernieTurbo.call(messages);
 *
 * res = await ernie.call(messages);
 * ```
 */
export class ChatAliQWen extends BaseChatModel implements AliQWenChatInput {
  static lc_name() {
    return 'ChatAliQWen'
  }
  get callKeys() {
    return ['stop', 'signal', 'options']
  }
  get lc_secrets() {
    return {
      aliApiKey: 'ALI_API_KEY'
    }
  }
  get lc_aliases() {
    return undefined
  }

  lc_serializable: boolean

  aliApiKey?: string
  streaming: boolean
  prefixMessages?: QWenMessage[]
  modelName: ChatCompletionRequest['model']
  apiUrl: string
  temperature?: number | undefined
  repetitionPenalty?: number | undefined
  maxTokens?: number | undefined
  topP?: number | undefined
  topK?: number | undefined
  seed?: number | undefined
  enableSearch?: boolean | undefined

  constructor(fields: Partial<AliQWenChatInput> & BaseChatModelParams = {}) {
    super(fields)

    this.aliApiKey = fields?.aliApiKey ?? getEnvironmentVariable('ALI_API_KEY')
    if (!this.aliApiKey) {
      throw new Error('Ali API key not found')
    }

    this.apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
    this.lc_serializable = false
    this.streaming = fields.streaming ?? false
    this.prefixMessages = fields.prefixMessages ?? []
    this.temperature = fields.temperature
    this.topP = fields.topP
    this.topK = fields.topK
    this.seed = fields.seed
    this.maxTokens = fields.maxTokens
    this.repetitionPenalty = fields.repetitionPenalty
    this.modelName = fields.modelName ?? 'qwen-turbo'
  }

  /**
   * Get the parameters used to invoke the model
   */
  invocationParams(): ChatCompletionRequest['parameters'] {
    const parameters: ChatCompletionRequest['parameters'] = {
      stream: this.streaming,
      temperature: this.temperature,
      top_p: this.topP,
      top_k: this.topK,
      seed: this.seed,
      max_tokens: this.maxTokens,
      result_format: 'text',
      enable_search: this.enableSearch
    }

    if (this.streaming) {
      parameters.incremental_output = true
    } else {
      parameters.repetition_penalty = this.repetitionPenalty
    }

    return parameters
  }

  /**
   * Get the identifying parameters for the model
   */
  identifyingParams() {
    return {
      model: this.modelName,
      ...this.invocationParams()
    }
  }

  /** @ignore */
  async _generate(
    messages: BaseMessage[],
    options?: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    const tokenUsage: {
      completionTokens: number
      promptTokens: number
      totalTokens: number
    } = {
      completionTokens: 0,
      promptTokens: 0,
      totalTokens: 0
    }
    const parameters = this.invocationParams()

    const messagesMapped: QWenMessage[] = messages.map((message) => ({
      role: messageToQWenRole(message),
      content: message.content as string
    }))

    const data: any = parameters.stream
      ? await new Promise((resolve, reject) => {
          let response
          let rejected = false
          let resolved = false
          this.completionWithRetry(
            {
              model: this.modelName,
              parameters,
              input: {
                messages: messagesMapped
              }
            },
            true,
            options?.signal,
            (event) => {
              const data = JSON.parse(event.data)
              if (data?.code) {
                if (rejected) {
                  return
                }
                rejected = true
                reject(new Error(data?.message))
                return
              }

              const { text, finish_reason } = data.output
              const { output_tokens, input_tokens, total_tokens } = data.usage

              const usage = {
                completion_tokens: output_tokens,
                prompt_tokens: input_tokens,
                total_tokens: total_tokens
              }

              // on the first message set the response properties
              if (!response) {
                response = {
                  id: data.request_id,
                  object: 'chat.completion.chunk',
                  created: Date.now() / 1000,
                  result: text,
                  usage: usage
                }
              } else {
                response.result += text
                response.created = Date.now() / 1000
                response.usage = usage
              }

              // TODO this should pass part.index to the callback
              // when that's supported there
              // eslint-disable-next-line no-void
              void runManager?.handleLLMNewToken(text ?? '')
              if (finish_reason && finish_reason !== 'null') {
                if (resolved || rejected) {
                  return
                }
                resolved = true
                resolve(response)
              }
            }
          ).catch((error) => {
            if (!rejected) {
              rejected = true
              reject(error)
            }
          })
        })
      : await this.completionWithRetry(
          {
            model: this.modelName,
            parameters,
            input: {
              messages: messagesMapped
            }
          },
          false,
          options?.signal
        ).then((data) => {
          if (data?.code) {
            throw new Error(data?.message)
          }

          const { output, usage } = data

          return {
            id: data.request_id,
            object: 'chat.completion.chunk',
            created: Date.now() / 1000,
            result: output.text,
            usage: {
              completion_tokens: usage.output_tokens,
              prompt_tokens: usage.input_tokens,
              total_tokens: usage.total_tokens
            }
          }
        })

    const {
      completion_tokens: completionTokens,
      prompt_tokens: promptTokens,
      total_tokens: totalTokens
    } = data.usage ?? {} ?? {}

    if (completionTokens) {
      tokenUsage.completionTokens = (tokenUsage.completionTokens ?? 0) + completionTokens
    }
    if (promptTokens) {
      tokenUsage.promptTokens = (tokenUsage.promptTokens ?? 0) + promptTokens
    }
    if (totalTokens) {
      tokenUsage.totalTokens = (tokenUsage.totalTokens ?? 0) + totalTokens
    }
    const generations: ChatResult['generations'] = []
    const text = data.result ?? ''

    generations.push({
      text,
      message: new AIMessage(text)
    })

    return {
      generations,
      llmOutput: { tokenUsage }
    }
  }
  /** @ignore */
  async completionWithRetry(
    request: ChatCompletionRequest,
    stream: boolean,
    signal?: AbortSignal,
    onmessage?: (event: MessageEvent) => void
  ): Promise<any> {
    const makeCompletionRequest = async () => {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          ...(stream ? { Accept: 'text/event-stream' } : {}),
          Authorization: `Bearer ${this.aliApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        signal
      })

      if (!stream) {
        return response.json()
      }

      if (response.body) {
        // response will not be a stream if an error occurred
        if (!response.headers.get('content-type')?.startsWith('text/event-stream')) {
          onmessage?.(
            new MessageEvent('message', {
              data: await response.text()
            })
          )
          return
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let data = ''
        let continueReading = true
        while (continueReading) {
          const { done, value } = await reader.read()
          if (done) {
            continueReading = false
            break
          }
          data += decoder.decode(value)
          let continueProcessing = true
          while (continueProcessing) {
            const newlineIndex = data.indexOf('\n')
            if (newlineIndex === -1) {
              continueProcessing = false
              break
            }
            const line = data.slice(0, newlineIndex)
            data = data.slice(newlineIndex + 1)
            if (line.startsWith('data:')) {
              const event = new MessageEvent('message', {
                data: line.slice('data:'.length).trim()
              })
              onmessage?.(event)
            }
          }
        }
      }
    }

    return this.caller.call(makeCompletionRequest)
  }

  _llmType(): string {
    return 'aliQWen'
  }

  /** @ignore */
  _combineLLMOutput(): never[] {
    return []
  }
}
