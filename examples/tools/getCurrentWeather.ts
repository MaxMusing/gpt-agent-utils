import { z } from "zod";
import { type Tool } from "../../src";

const schema = z.object({
  location: z.string().describe("The city and state, e.g. San Francisco, CA"),
  unit: z.enum(["celsius", "fahrenheit"]).optional(),
});

function callback({ location, unit = "fahrenheit" }: z.infer<typeof schema>) {
  const weatherInfo = {
    location: location,
    temperature: `62 °${unit === "celsius" ? "C" : "F"}`,
    windSpeed: "20 mph",
  };
  return JSON.stringify(weatherInfo);
}

export const getCurrentWeather: Tool = {
  name: "get_current_weather",
  description: "Get the current temperature and wind speed in a given location",
  schema,
  callback,
};
