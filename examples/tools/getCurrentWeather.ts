import { z } from "zod";
import { type Tool } from "../../src";

const schema = z.object({
  location: z.string().describe("The city and state, e.g. San Francisco, CA"),
});

function callback({ location }: z.infer<typeof schema>) {
  // This would normally be an API call
  return JSON.stringify({
    location: location,
    temperature: "42 °F",
    windSpeed: "30 mph",
  });
}

export const getCurrentWeather: Tool = {
  name: "get_current_weather",
  description: "Get the current temperature and wind speed in a given location",
  schema,
  callback,
};
