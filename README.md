# gpt-agent-utils

Lightweight utils that make it easier to build agents with GPT.

## Usage

### Defining a tool

You can define a [`Tool`](src/types.ts) using a Zod schema and a callback function. The callback can optionally be async.

See [`examples/tools/getCurrentWeather.ts`](examples/tools/getCurrentWeather.ts) for more details.

```ts
import { type Tool } from "gpt-agent-utils";

const schema = z.object({
  location: z.string().describe("The city and state, e.g. San Francisco, CA"),
  unit: z.enum(["celsius", "fahrenheit"]).optional(),
});

function callback({
  location,
  unit = "fahrenheit",
}: z.infer<typeof schema>) {
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

See [`examples/index.ts`](examples/index.ts) for more details.

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
