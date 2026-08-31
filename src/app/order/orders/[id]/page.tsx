import { Suspense } from 'react';
import OrderStatusPage from '@/components/order/OrderStatusPage';

export default async function OrderStatusRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <OrderStatusPage orderId={id} />
    </Suspense>
  );
}
