import Sandbox from "sandbox";
import { z } from "zod";
import { type Tool } from "../../src";

const schema = z.object({
  code: z.string().describe("JavaScript code to run"),
});

function callback({ code }: z.infer<typeof schema>) {
  return new Promise<string>((resolve) => {
    const sandbox = new Sandbox();

    sandbox.run(code, function (output) {
      resolve(output.result);
    });
  });
}

export const runJavascriptCode: Tool = {
  name: "run_javascript_code",
  description: "Runs JavaScript code and returns the result",
  schema,
  callback,
};
