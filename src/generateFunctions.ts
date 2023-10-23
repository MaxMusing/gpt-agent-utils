import zodToJsonSchema from "zod-to-json-schema";
import { Tool } from "./types";

/**
 * Converts tools into the format expected by OpenAI.
 * @param tools Array of tools you want GPT to have access to
 * @returns Array which can be passed to OpenAI in the `functions` parameter
 */
export function generateFunctions(tools: Tool[]) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: zodToJsonSchema(tool.schema),
  }));
}
