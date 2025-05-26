import { drizzle } from 'drizzle-orm/bun-sql';
import { migrate } from 'drizzle-orm/bun-sql/migrator'
import * as schema from './schema';

const db = drizzle('postgres://postgres:postgres@localhost:5432/beasybox', {
    schema,
    casing: 'snake_case'
})

const migration = drizzle('postgres://postgres:postgres@localhost:5432/beasybox', {
    schema,
    casing: 'snake_case'
})

await migrate(migration, {migrationsFolder: './drizzle'})

await migration.$client.close()

export { db };