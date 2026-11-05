import { useCounter, useCounterAction, useHello } from '@repo/api-client';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@repo/api';
import type { Route } from './+types/home';
import { api as client } from '@/lib/api';
import { cloudflare } from '@/lib/cloudflare';

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Fullstack Template' }];
}

// Server-side: call the API in-process (no HTTP hop) and render the result into the HTML.
export async function loader({ context }: Route.LoaderArgs) {
  const res = await api.request('/hello', {}, context.get(cloudflare).env);
  return { serverHello: (await res.json()) as { message: string } };
}

function HelloCard() {
  const hello = useHello(client);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hello world</CardTitle>
        <CardDescription>GET /api/hello from the browser</CardDescription>
      </CardHeader>
      <CardContent>
        {hello.isPending && <p className="text-muted-foreground">Loading…</p>}
        {hello.isError && <p className="text-destructive">Can't reach the API. Is it running?</p>}
        {hello.data && (
          <>
            <p className="text-xl">{hello.data.message}</p>
            <p className="mt-1 text-sm text-muted-foreground">{hello.data.timestamp}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CounterCard() {
  const counter = useCounter(client);
  const action = useCounterAction(client);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Counter</CardTitle>
        <CardDescription>Stored in Cloudflare D1</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <p className="text-6xl font-bold tabular-nums">{counter.data?.value ?? '–'}</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Decrement"
            disabled={action.isPending}
            onClick={() => action.mutate('decrement')}
          >
            <Minus />
          </Button>
          <Button
            variant="secondary"
            disabled={action.isPending}
            onClick={() => action.mutate('reset')}
          >
            <RotateCcw /> Reset
          </Button>
          <Button
            size="icon"
            aria-label="Increment"
            disabled={action.isPending}
            onClick={() => action.mutate('increment')}
          >
            <Plus />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Fullstack Template</h1>
      <p className="text-sm text-muted-foreground">SSR: {loaderData.serverHello.message}</p>
      <HelloCard />
      <CounterCard />
    </main>
  );
}
