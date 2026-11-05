import api from '@repo/api';
import { Hono } from 'hono';
import { createRequestHandler, RouterContextProvider } from 'react-router';
import { cloudflare } from '../app/lib/cloudflare';

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
);

// One Worker: the Hono API under /api, everything else is server-rendered by React Router.
const app = new Hono<{ Bindings: Env }>().route('/api', api).all('*', (c) => {
  const context = new RouterContextProvider();
  context.set(cloudflare, { env: c.env, ctx: c.executionCtx as ExecutionContext });
  return requestHandler(c.req.raw, context);
});

export default app satisfies ExportedHandler<Env>;
