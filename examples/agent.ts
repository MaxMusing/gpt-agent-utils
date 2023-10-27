import OpenAI from "openai";
import { getCurrentWeather } from "./tools/getCurrentWeather";
import { runJavascriptCode } from "./tools/runJavascriptCode";
import {
  handleFunctionCall,
  generateFunctions,
  truncateMessages,
} from "../src";

const openai = new OpenAI();

async function runAgent(prompt: string) {
  let messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: prompt,
    },
  ];

  const tools = [getCurrentWeather, runJavascriptCode];
  const maximumDepth = 5;

  for (let i = 0; i < maximumDepth; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      // Removes older messages if necessary to stay under the token limit
      messages: truncateMessages({ messages, tools, tokenLimit: 1000 }),
      // Formats the tools into the shape that OpenAI expects
      functions: generateFunctions(tools),
    });

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage);

    if (responseMessage.function_call) {
      // Validates arguments and calls the function
      const functionResponseMessage = await handleFunctionCall({
        functionCall: responseMessage.function_call,
        tools,
      });
      messages.push(functionResponseMessage);
    } else {
      return responseMessage.content;
    }
  }

  return messages;
}

runAgent("Get the temperature in Boston and calculate the wind chill.")
  .then(console.log)
  .catch(console.error);

// Outputs: The current temperature in Boston, MA is 42 °F with a wind speed of
// 30 mph. The wind chill is calculated to be 31 °F.
