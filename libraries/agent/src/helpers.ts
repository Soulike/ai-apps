import type {
  ChatCompletion,
  ChatCompletionMessageFunctionToolCall,
} from 'openai/resources/chat/completions';

/**
 * Extracts text content from all choices in a chat completion response.
 */
export function extractContent(response: ChatCompletion): string[] {
  return response.choices
    .map((choice) => choice.message.content)
    .filter((content): content is string => !!content);
}

/**
 * Extracts function tool calls from all choices in a chat completion response.
 */
export function extractToolCalls(
  response: ChatCompletion,
): ChatCompletionMessageFunctionToolCall[] {
  return response.choices.flatMap(
    (choice) =>
      choice.message.tool_calls?.filter(
        (tc): tc is ChatCompletionMessageFunctionToolCall =>
          tc.type === 'function',
      ) ?? [],
  );
}
