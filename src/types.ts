import { z } from "zod";

export interface Tool {
  name: string;
  description: string;
  schema: z.ZodObject<any>;
  callback: Function;
}
