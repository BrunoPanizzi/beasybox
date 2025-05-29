import { drizzle } from "drizzle-orm/bun-sql"
import { migrate } from "drizzle-orm/bun-sql/migrator"

import * as schema from "./schema"

import { env } from "~/utils/env"

const db = drizzle(env.DATABASE_URL, {
  schema,
  casing: "snake_case",
})

const migration = drizzle(env.DATABASE_URL, {
  schema,
  casing: "snake_case",
})

await migrate(migration, { migrationsFolder: "./drizzle" })

await migration.$client.close()

export { db }
