import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

import { AppButton } from '@/screens/native/shared/Buttons';
import { AppScreen } from '@/screens/native/shared/AppScreen';
import { SectionCard } from '@/screens/native/shared/SectionCard';

type PaymentStatusScreenProps = {
  mode: 'success' | 'failure';
};

export default function PaymentStatusScreen({ mode }: PaymentStatusScreenProps) {
  const router = useRouter();
  const { orderNumber } = useLocalSearchParams<{ orderNumber?: string }>();

  const isSuccess = mode === 'success';

  return (
    <AppScreen title={isSuccess ? 'Payment complete' : 'Payment not completed'} subtitle="Handle payment recovery and confirmation without sending users back through the web shell." canGoBack>
      <SectionCard
        title={isSuccess ? 'Your order is confirmed' : 'Your order still needs attention'}
        subtitle={orderNumber ? `Order ${orderNumber}` : 'Order status update'}
      >
        <AppButton label="Open orders" onPress={() => router.replace('/orders' as never)} />
        <AppButton label={isSuccess ? 'Continue shopping' : 'Back to cart'} variant="secondary" onPress={() => router.replace((isSuccess ? '/shop' : '/cart') as never)} />
      </SectionCard>
    </AppScreen>
  );
}