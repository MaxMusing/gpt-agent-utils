# gpt-agent-utils

Lightweight utils that make it easier to build agents with GPT.

See [`examples/agent.ts`](examples/agent.ts) for a full example of an agent implemented in 35 lines of code.

## Usage

This project doesn't have any official releases yet. If you want to try it, you have two options:

1. Build from source

```
pnpm run build
```

2. Install from repo

```
npm i git+https://github.com/MaxMusing/gpt-agent-utils.git
```

## Tools

Tools are functions that you can define that give GPT the ability to take certain actions beyond generating text. These can be used for fetching or mutating data from external systems, or for performing more complex computations.

### Defining a tool

You can define a [`Tool`](src/types.ts) using a Zod schema and a callback function. The callback can optionally be async.

See [`examples/tools/getCurrentWeather.ts`](examples/tools/getCurrentWeather.ts) for a full example.

```ts
import { type Tool } from "gpt-agent-utils";

const schema = z.object({
  location: z.string().describe("The city and state, e.g. San Francisco, CA"),
  unit: z.enum(["celsius", "fahrenheit"]).optional(),
});

function callback({ location, unit = "fahrenheit" }: z.infer<typeof schema>) {
  const weatherInfo = {
    location: location,
    temperature: "72",
    unit: unit,
    forecast: ["sunny", "windy"],
  };
  return JSON.stringify(weatherInfo);
}

const tool: Tool = {
  name: "get_current_weather",
  description: "Get the current weather in a given location",
  schema,
  callback,
};
```

### Using tools

You can use [`generateFunctions`](src/generateFunctions.ts) to convert tools into the format OpenAI expects, then use [`handleFunctionCall`](src/handleFunctionCall.ts) to parse the response from GPT and run the appropriate callback.

```ts
import { generateFunctions, handleFunctionCall } from "gpt-agent-utils";

const tools = [getCurrentWeather];

const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: messages,
  functions: generateFunctions(tools),
});

if (response.choices[0].message.function_call) {
  await handleFunctionCall({
    functionCall: response.choices[0].message.function_call,
    tools,
  });
}
```

## Context management

GPT has a limited context window, so you need to selectively limit what context gets passed for each call.

### Truncating messages

You can use [`truncateMessages`](src/truncateMessages.ts) to select the most recent messages that fit within a provided token limit. This is useful for implementing a simple sliding window memory.

```ts
import { generateFunctions, truncateMessages } from "gpt-agent-utils";

const tools = [getCurrentWeather];

const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: truncateMessages({ messages, tools, tokenLimit: 1000 }),
  functions: generateFunctions(tools),
});
```
