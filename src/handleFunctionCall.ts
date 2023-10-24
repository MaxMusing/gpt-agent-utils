import OpenAI from "openai";
import { Tool } from "./types";

/**
 * Handles a function call from OpenAI by running the callback and forming a
 * message response to pass back to OpenAI.
 * @param param.functionCall Function call response from OpenAI.
 * @param param.tools Tools being used in your chat.
 * @returns Message which can be passed to OpenAI in the `messages` parameter
 */
export async function handleFunctionCall({
  functionCall,
  tools,
}: {
  functionCall: OpenAI.Chat.Completions.ChatCompletionMessage.FunctionCall;
  tools: Tool[];
}): Promise<OpenAI.ChatCompletionMessageParam> {
  try {
    const tool = tools.find((tool) => tool.name === functionCall.name);
    if (!tool) {
      throw new Error(`No tool found with name ${functionCall.name}`);
    }

    const jsonParsedArguments = JSON.parse(functionCall.arguments);
    const zodParsedArguments = tool.schema.parse(jsonParsedArguments);
    const response = await tool.callback(zodParsedArguments);

    return {
      role: "function",
      name: functionCall.name,
      content: response,
    };
  } catch (error) {
    return {
      role: "function",
      name: functionCall.name,
      content: `Error running function: ${error}`,
    };
  }
}
