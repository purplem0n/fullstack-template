import type { D1Database } from '@cloudflare/workers-types';
import type { Counter, HelloResponse } from '@repo/shared';
import { cors } from 'hono/cors';
import { Hono } from 'hono';

type Env = { Bindings: { DB: D1Database } };

const SQL = {
  get: 'SELECT value FROM counter WHERE id = 1',
  increment: 'UPDATE counter SET value = value + 1 WHERE id = 1 RETURNING value',
  decrement: 'UPDATE counter SET value = value - 1 WHERE id = 1 RETURNING value',
  reset: 'UPDATE counter SET value = 0 WHERE id = 1 RETURNING value',
} as const;

async function run(db: D1Database, sql: string): Promise<Counter> {
  const row = await db.prepare(sql).first<{ value: number }>();
  return { value: row?.value ?? 0 };
}

// Routes are chained so `AppType` carries every route for the typed RPC client.
const app = new Hono<Env>()
  .use('*', cors())
  .get('/hello', (c) =>
    c.json<HelloResponse>({
      message: 'Hello from Hono on Cloudflare Workers!',
      timestamp: new Date().toISOString(),
    }),
  )
  .get('/counter', async (c) => c.json(await run(c.env.DB, SQL.get)))
  .post('/counter/increment', async (c) => c.json(await run(c.env.DB, SQL.increment)))
  .post('/counter/decrement', async (c) => c.json(await run(c.env.DB, SQL.decrement)))
  .post('/counter/reset', async (c) => c.json(await run(c.env.DB, SQL.reset)));

export type AppType = typeof app;
export default app;
