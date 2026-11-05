import { createApiClient } from '@repo/api-client';

// The API lives on the same Worker under /api, so the browser always uses its own origin.
export const api = createApiClient(
  typeof window === 'undefined' ? 'http://localhost/api' : `${window.location.origin}/api`,
);
