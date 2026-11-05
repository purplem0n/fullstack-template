import { createApiClient } from '@repo/api-client';
import Constants from 'expo-constants';

// Dev: a phone can't reach "localhost" on the Mac, so reuse the Mac's LAN IP that Metro reports
// (same IP the phone used to load the app). Simulators get localhost.
// Prod: EXPO_PUBLIC_API_URL (the Worker URL + /api) from .env.production (EAS builds, `bun run dev:mobile:prod-api`).
const devHost = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

export const api = createApiClient(process.env.EXPO_PUBLIC_API_URL || `http://${devHost}:5173/api`);
