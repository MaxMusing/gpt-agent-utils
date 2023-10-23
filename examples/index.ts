import OpenAI from "openai";
import getCurrentWeather from "./tools/getCurrentWeather";
import { handleFunctionCall, generateFunctions } from "../src";

const openai = new OpenAI();

async function runConversation() {
  let messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "user", content: "What's the weather like in Boston?" },
  ];

  const tools = [getCurrentWeather];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    functions: generateFunctions(tools),
  });
  const responseMessage = response.choices[0].message;

  if (responseMessage.function_call) {
    messages.push(responseMessage);

    try {
      const functionResponse = await handleFunctionCall({
        functionCall: responseMessage.function_call,
        tools,
      });
      messages.push({
        role: "function",
        name: responseMessage.function_call.name,
        content: functionResponse,
      });
    } catch (error) {
      messages.push({
        role: "function",
        name: responseMessage.function_call.name,
        content: `Error running function: ${error}`,
      });
    }

    const secondResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    return secondResponse;
  }
}

runConversation().then(console.log).catch(console.error);
