import { expect, test } from 'bun:test';
import { Counter, CounterAction } from './index';

test('Counter schema accepts integers only', () => {
  expect(Counter.safeParse({ value: 3 }).success).toBe(true);
  expect(Counter.safeParse({ value: 1.5 }).success).toBe(false);
});

test('CounterAction lists the supported actions', () => {
  expect(CounterAction.options).toEqual(['increment', 'decrement', 'reset']);
});
