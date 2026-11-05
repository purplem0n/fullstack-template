import { z } from 'zod';

/** GET /hello */
export const HelloResponse = z.object({
  message: z.string(),
  timestamp: z.string(),
});
export type HelloResponse = z.infer<typeof HelloResponse>;

/** Counter state, shared by API, web, and mobile. */
export const Counter = z.object({ value: z.number().int() });
export type Counter = z.infer<typeof Counter>;

export const CounterAction = z.enum(['increment', 'decrement', 'reset']);
export type CounterAction = z.infer<typeof CounterAction>;
