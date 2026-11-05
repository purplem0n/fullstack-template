import { useCounter, useCounterAction, useHello } from '@repo/api-client';
import type { CounterAction } from '@repo/shared';
import { api } from './api';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="w-full rounded-lg border border-border bg-surface p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  );
}

function HelloCard() {
  const hello = useHello(api);
  return (
    <Card title="Hello world">
      {hello.isPending && <p className="text-muted">Loading…</p>}
      {hello.isError && <p className="text-danger">Can't reach the API. Is it running?</p>}
      {hello.data && (
        <>
          <p className="text-xl">{hello.data.message}</p>
          <p className="mt-1 text-sm text-muted">{hello.data.timestamp}</p>
        </>
      )}
    </Card>
  );
}

function CounterCard() {
  const counter = useCounter(api);
  const action = useCounterAction(api);
  const button = (a: CounterAction, label: string, primary = false) => (
    <button
      type="button"
      disabled={action.isPending}
      onClick={() => action.mutate(a)}
      className={`rounded-md px-5 py-3 font-medium transition disabled:opacity-50 ${
        primary
          ? 'bg-primary text-primary-text hover:opacity-90'
          : 'border border-border hover:bg-border'
      }`}
    >
      {label}
    </button>
  );
  return (
    <Card title="Counter (D1)">
      <p className="mb-6 text-center text-6xl font-bold tabular-nums">
        {counter.data?.value ?? '–'}
      </p>
      <div className="flex justify-center gap-3">
        {button('decrement', '−')}
        {button('reset', 'Reset')}
        {button('increment', '+', true)}
      </div>
    </Card>
  );
}

export default function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Fullstack Template</h1>
      <HelloCard />
      <CounterCard />
    </main>
  );
}
