import { createClient } from "@libsql/client";

declare global {
  // eslint-disable-next-line no-var
  var db_zonetv: ReturnType<typeof createClient> | undefined;
}

// Database path - use absolute path
const dbPath = process.cwd() + "/dev.db";

export const db =
  global.db_zonetv ??
  createClient({
    url: "file://" + dbPath,
  });

if (process.env.NODE_ENV !== "production") {
  global.db_zonetv = db;
}

// Helper for querying with parameters - returns array of rows
export async function query<T = unknown>(sql: string, args: unknown[] = []): Promise<T[]> {
  const result = await db.execute({ sql, args });
  return result.rows as T[];
}

// Helper for single row
export async function queryOne<T = unknown>(sql: string, args: unknown[] = []): Promise<T | null> {
  const result = await db.execute({ sql, args });
  return (result.rows[0] as T) ?? null;
}

// Helper for insert/update/delete
export async function executeSql(sql: string, args: unknown[] = []) {
  return db.execute({ sql, args });
}

// Alias for executeSql - commonly used name
export async function runQuery(sql: string, args: unknown[] = []) {
  return db.execute({ sql, args });
}
