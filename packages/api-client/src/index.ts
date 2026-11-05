import type { AppType } from '@repo/api';
import type { CounterAction } from '@repo/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hc } from 'hono/client';

export const createApiClient = (baseUrl: string) => hc<AppType>(baseUrl);
export type ApiClient = ReturnType<typeof createApiClient>;

export const queryKeys = { hello: ['hello'] as const, counter: ['counter'] as const };

export function useHello(api: ApiClient) {
  return useQuery({
    queryKey: queryKeys.hello,
    queryFn: async () => (await api.hello.$get()).json(),
  });
}

export function useCounter(api: ApiClient) {
  return useQuery({
    queryKey: queryKeys.counter,
    queryFn: async () => (await api.counter.$get()).json(),
  });
}

export function useCounterAction(api: ApiClient) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (action: CounterAction) => (await api.counter[action].$post()).json(),
    onSuccess: (data) => qc.setQueryData(queryKeys.counter, data),
  });
}
