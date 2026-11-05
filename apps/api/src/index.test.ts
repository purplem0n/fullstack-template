import { expect, test } from 'bun:test';
import type { D1Database } from '@cloudflare/workers-types';
import { HelloResponse } from '@repo/shared';
import app from './index';

test('GET /hello returns a valid HelloResponse', async () => {
  const res = await app.request('/hello');
  expect(res.status).toBe(200);
  expect(HelloResponse.safeParse(await res.json()).success).toBe(true);
});

test('counter routes use D1', async () => {
  let value = 0;
  const DB = {
    prepare: (sql: string) => ({
      first: async () => {
        if (sql.includes('+ 1')) value += 1;
        else if (sql.includes('- 1')) value -= 1;
        else if (sql.includes('= 0')) value = 0;
        return { value };
      },
    }),
  } as unknown as D1Database;
  const inc = await app.request('/counter/increment', { method: 'POST' }, { DB });
  expect(await inc.json()).toEqual({ value: 1 });
  const reset = await app.request('/counter/reset', { method: 'POST' }, { DB });
  expect(await reset.json()).toEqual({ value: 0 });
});
