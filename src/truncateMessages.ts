import OpenAI from "openai";
import { promptTokensEstimate } from "openai-chat-tokens";
import { generateFunctions } from "./generateFunctions";
import { Tool } from "./types";

/**
 * Truncates an array of messages (removing the earliest) to fit within the
 * provided token limit. Note that you should pass a token limit below the
 * context limit of the model you are using to allow enough tokens for the
 * response.
 * @param param.messages Messages in your chat.
 * @param param.tools Tools being used in your chat.
 * @param param.tokenLimit Maximum number of tokens to allow. Uses cl100k_base encoding.
 * @returns Array of messages that fit within the token limit.
 */
export function truncateMessages({
  messages,
  tools,
  tokenLimit,
}: {
  messages: OpenAI.ChatCompletionMessageParam[];
  tools?: Tool[];
  tokenLimit: number;
}): OpenAI.ChatCompletionMessageParam[] {
  let truncatedMessages = [...messages];
  let tokensInTruncatedMessages = promptTokensEstimate({
    messages,
    functions: generateFunctions(tools),
  });

  while (tokensInTruncatedMessages > tokenLimit) {
    // Remove the earliest message
    truncatedMessages = truncatedMessages.slice(1);

    tokensInTruncatedMessages = promptTokensEstimate({
      messages: truncatedMessages,
      functions: generateFunctions(tools),
    });

    if (truncatedMessages.length === 0) {
      throw new Error("No messages can fit within the token limit.");
    }
  }

  return truncatedMessages;
}
