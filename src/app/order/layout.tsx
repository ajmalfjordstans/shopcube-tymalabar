import OrderProviders from '@/components/order/OrderProviders';
import OrderHeader from '@/components/order/OrderHeader';
import OrderBottomNav from '@/components/order/OrderBottomNav';
import { getStoreBySlugApi } from '@/lib/order/api';
import { STORE_SLUG } from '@/lib/order/config';
import { OrderCartProvider } from '@/context/OrderCartContext';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await getStoreBySlugApi(STORE_SLUG);
    const name = res?.data?.name;
    return {
      title: name ? `${name} — Order Online` : 'Order Online — Ty Malabar',
      description: `Order online for collection or delivery from ${name ?? 'Ty Malabar'}.`,
    };
  } catch {
    return { title: 'Order Online — Ty Malabar' };
  }
}

export default async function OrderLayout({ children }: { children: React.ReactNode }) {
  const storeResult = await getStoreBySlugApi(STORE_SLUG).catch(() => null);
  const reservationEnabled = storeResult?.data?.reservationEnabled ?? true;
  const giftCardEnabled = storeResult?.data?.giftCardEnabled ?? true;

  return (
    <OrderProviders>
      <OrderCartProvider storeId={STORE_SLUG}>
        <div className="bg-[#F5F5DC] min-h-screen pt-[130px] pb-24 md:pb-0 font-poppins">
          <OrderHeader />
          <div className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </div>
          <OrderBottomNav reservationEnabled={reservationEnabled} giftCardEnabled={giftCardEnabled} />
        </div>
      </OrderCartProvider>
    </OrderProviders>
  );
}
