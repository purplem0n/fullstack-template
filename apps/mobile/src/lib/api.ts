import { createApiClient } from '@repo/api-client';
import Constants from 'expo-constants';

// On a device, "localhost" is the phone itself, so reuse the dev machine's LAN IP from Metro.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

export const api = createApiClient(process.env.EXPO_PUBLIC_API_URL ?? `http://${devHost}:8787`);
