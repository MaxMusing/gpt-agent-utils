import OpenAI from "openai";
import getCurrentWeather from "./tools/getCurrentWeather";
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
      content: "What's the weather like in Boston?",
    },
  ];

  const tools = [getCurrentWeather];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: truncateMessages({ messages, tools, tokenLimit: 1000 }),
    functions: generateFunctions(tools),
  });
  const responseMessage = response.choices[0].message;
  messages.push(responseMessage);

  if (responseMessage.function_call) {
    const message = await handleFunctionCall({
      functionCall: responseMessage.function_call,
      tools,
    });
    messages.push(message);

    const secondResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: truncateMessages({ messages, tools, tokenLimit: 1000 }),
      functions: generateFunctions(tools),
    });
    const secondResponseMessage = secondResponse.choices[0].message;
    messages.push(secondResponseMessage);
  }

  return messages;
}

runConversation().then(console.log).catch(console.error);
