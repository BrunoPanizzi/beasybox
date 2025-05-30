import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  GEMINI_API_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
