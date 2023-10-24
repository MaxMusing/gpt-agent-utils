import OpenAI from "openai";
import { getCurrentWeather } from "./tools/getCurrentWeather";
import { runJavaScriptCode } from "./tools/runJavaScriptCode";
import {
  handleFunctionCall,
  generateFunctions,
  truncateMessages,
} from "../src";

const openai = new OpenAI();

async function runConversation() {
  let messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: "Get the temperature in Boston and calculate the wind chill.",
    },
  ];

  const tools = [getCurrentWeather, runJavaScriptCode];
  const maximumDepth = 5;

  for (let i = 0; i < maximumDepth; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: truncateMessages({ messages, tools, tokenLimit: 1000 }),
      functions: generateFunctions(tools),
    });

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage);

    if (responseMessage.function_call) {
      const functionResponseMessage = await handleFunctionCall({
        functionCall: responseMessage.function_call,
        tools,
      });
      messages.push(functionResponseMessage);
    } else {
      // End the conversation once the AI responds with a simple message
      break;
    }
  }

  return messages;
}

runConversation().then(console.log).catch(console.error);
