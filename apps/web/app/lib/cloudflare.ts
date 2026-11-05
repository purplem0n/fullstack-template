import { createContext } from 'react-router';

// Worker env (D1, secrets) and ctx, available in loaders/actions via context.get(cloudflare).
export const cloudflare = createContext<{ env: Env; ctx: ExecutionContext }>();
