import { useCounter, useCounterAction, useHello } from '@repo/api-client';
import { ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { api } from '@/lib/api';

function HelloCard() {
  const hello = useHello(api);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello world</CardTitle>
        <CardDescription>GET /hello from the Workers API</CardDescription>
      </CardHeader>
      <CardContent>
        {hello.isPending && <Text className="text-muted-foreground">Loading…</Text>}
        {hello.isError && (
          <Text className="text-destructive">Can't reach the API. Is it running?</Text>
        )}
        {hello.data && (
          <>
            <Text className="text-xl">{hello.data.message}</Text>
            <Text className="mt-1 text-sm text-muted-foreground">{hello.data.timestamp}</Text>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CounterCard() {
  const counter = useCounter(api);
  const action = useCounterAction(api);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Counter</CardTitle>
        <CardDescription>Stored in Cloudflare D1</CardDescription>
      </CardHeader>
      <CardContent className="items-center gap-6">
        <Text className="text-6xl font-bold">{counter.data?.value ?? '–'}</Text>
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            disabled={action.isPending}
            onPress={() => action.mutate('decrement')}
          >
            <Text>−</Text>
          </Button>
          <Button
            variant="secondary"
            disabled={action.isPending}
            onPress={() => action.mutate('reset')}
          >
            <Text>Reset</Text>
          </Button>
          <Button disabled={action.isPending} onPress={() => action.mutate('increment')}>
            <Text>+</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <ScrollView className="bg-background" contentContainerClassName="gap-6 p-6">
      <HelloCard />
      <CounterCard />
    </ScrollView>
  );
}
