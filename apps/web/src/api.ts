import { createApiClient } from '@repo/api-client';

// Dev: same host as the page (localhost on the Mac, LAN IP from a phone) on port 8787.
// Prod: VITE_API_URL from .env.production.
const url = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8787`;

export const api = createApiClient(url);
