import { z } from "zod";
import { type Tool } from "../../src";

const schema = z.object({
  location: z.string().describe("The city and state, e.g. San Francisco, CA"),
  unit: z.enum(["celsius", "fahrenheit"]).optional(),
});

// Example dummy function hard coded to return the same weather
// In production, this could be your backend API or an external API
async function callback({
  location,
  unit = "fahrenheit",
}: z.infer<typeof schema>) {
  await new Promise((resolve) => setTimeout(resolve, 1));

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

export default tool;
