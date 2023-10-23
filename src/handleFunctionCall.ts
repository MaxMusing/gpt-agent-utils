import OpenAI from "openai";
import { Tool } from "./types";

/**
 * Handles a function call from OpenAI by running the callback and returning the result.
 */
export async function handleFunctionCall({
  functionCall,
  tools,
}: {
  functionCall: OpenAI.Chat.Completions.ChatCompletionMessage.FunctionCall;
  tools: Tool[];
}) {
  const tool = tools.find((tool) => tool.name === functionCall.name);
  if (!tool) {
    throw new Error(`No tool found with name ${functionCall.name}`);
  }

  const rawParams = JSON.parse(functionCall.arguments);
  const parsedParams = tool.schema.parse(rawParams);
  return tool.callback(parsedParams);
}
