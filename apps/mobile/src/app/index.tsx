import { useCounter, useCounterAction, useHello } from '@repo/api-client';
import type { CounterAction } from '@repo/shared';
import { colors, fontSize, radius, spacing } from '@repo/tokens';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function HelloCard() {
  const hello = useHello(api);
  return (
    <Card title="Hello world">
      {hello.isPending && <Text style={styles.muted}>Loading…</Text>}
      {hello.isError && <Text style={styles.error}>Can't reach the API. Is it running?</Text>}
      {hello.data && (
        <>
          <Text style={styles.message}>{hello.data.message}</Text>
          <Text style={styles.muted}>{hello.data.timestamp}</Text>
        </>
      )}
    </Card>
  );
}

function CounterCard() {
  const counter = useCounter(api);
  const action = useCounterAction(api);
  const button = (a: CounterAction, label: string, primary = false) => (
    <Pressable
      disabled={action.isPending}
      onPress={() => action.mutate(a)}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonOutline,
        (pressed || action.isPending) && { opacity: 0.6 },
      ]}
    >
      <Text style={[styles.buttonText, primary && { color: colors.primaryText }]}>{label}</Text>
    </Pressable>
  );
  return (
    <Card title="Counter (D1)">
      <Text style={styles.count}>{counter.data?.value ?? '–'}</Text>
      <View style={styles.row}>
        {button('decrement', '−')}
        {button('reset', 'Reset')}
        {button('increment', '+', true)}
      </View>
    </Card>
  );
}

export default function Home() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <HelloCard />
      <CounterCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    color: colors.muted,
    fontSize: fontSize.sm,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  message: { color: colors.text, fontSize: fontSize.lg },
  muted: { color: colors.muted, fontSize: fontSize.sm, marginTop: spacing.xs },
  error: { color: colors.danger },
  count: {
    color: colors.text,
    fontSize: fontSize.display,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontVariant: ['tabular-nums'],
  },
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  button: { borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonOutline: { borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
});
