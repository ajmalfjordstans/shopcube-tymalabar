import { Suspense } from 'react';
import PendingCheckoutPage from '@/components/order/PendingCheckoutPage';

export default function OrderPendingCheckoutRoute() {
  return (
    <Suspense fallback={null}>
      <PendingCheckoutPage />
    </Suspense>
  );
}
